import {
  Project,
  SyntaxKind,
  Scope,
  ClassDeclaration,
  SourceFile,
  Node,
  JSDocTagInfo,
  MethodDeclaration,
  PropertyDeclaration,
  GetAccessorDeclaration,
  SetAccessorDeclaration,
} from 'ts-morph';
import fs from 'fs-extra';
import path from 'path';
import { globSync } from 'glob';
import { BnumConfig } from '../core/utils/configclass';
import { EMPTY_STRING } from '@rotomeca/utils';

const PROJECT_ROOT = process.cwd();
const regexBraces = /\{([^}]*)\}/g;

interface JsDocTag {
  tagName: string;
  comment: string;
}

interface JsDocInfo {
  description: string;
  tags: JsDocTag[];
}

interface DocArrayItem {
  name: string;
  [key: string]: any;
}

interface ComponentDoc {
  name: string;
  description: string;
  structure: any[];
  properties: any[];
  dataAttributes: any[];
  events: any[];
  slots: any[];
  cssVars: any[];
  publicMethods: any[];
  publicProperties: any[];
  states: any[];
}

/**
 * Cache global pour les documents de composants déjà parsés.
 * Clé = Nom de la classe (string), Valeur = doc (object)
 */
const docCache = new Map<string, ComponentDoc>();

/**
 * Fusionne deux listes de documentation (props, events, etc.)
 * en s'assurant que les éléments de 'child' écrasent 'parent' s'ils ont le même 'name'.
 */
function mergeDocArray(
  parentArr: DocArrayItem[] = [],
  childArr: DocArrayItem[] = [],
): DocArrayItem[] {
  if (!parentArr || parentArr.length === 0) return childArr || [];
  if (!childArr || childArr.length === 0) return parentArr || [];

  const mergedMap = new Map<string, DocArrayItem>();

  // 1. Ajouter tous les parents
  for (const item of parentArr) {
    if (item.name) mergedMap.set(item.name, item);
  }

  // 2. Ajouter/Écraser avec les enfants
  for (const item of childArr) {
    if (item.name) mergedMap.set(item.name, item);
  }

  return Array.from(mergedMap.values());
}

/**
 * Extrait les infos TSDoc (description + tags).
 */
function getJsDocInfo(node: Node): JsDocInfo {
  // @ts-ignore
  const jsDoc = node.getJsDocs()[0];
  if (!jsDoc) {
    return { description: '', tags: [] };
  }

  const description = jsDoc.getDescription().trim();
  const tags = jsDoc.getTags().map((tag: any) => ({
    tagName: tag.getTagName(),
    comment: (tag.getCommentText() || '').trim(),
  }));

  return { description, tags };
}

/**
 * Parse un tag @param ou @returns.
 */
function parseParamTag(comment: string): { name: string; description: string } {
  const [name, ...descParts] = comment.split(' - ');
  return {
    name: name.trim(),
    description: descParts.join(' - ').trim(),
  };
}

function formatType(type: string): string {
  return type.replace(/import\((['"])[/\w-_\d]+\1\)\./g, '').trim();
}

/**
 * Point d'entrée pour l'analyse d'un fichier source.
 * Itère sur les classes et écrit les fichiers de doc.
 */
function parseComponents(source: SourceFile): void {
  const classes = source.getClasses();
  for (const classNode of classes) {
    const doc = getComponentDoc(classNode, source);
    if (doc) {
      const componentDir = path.dirname(source.getFilePath());
      const docPath = path.join(componentDir, `${doc.name}.doc.json`);
      fs.writeJsonSync(docPath, doc, { spaces: 2 });
      console.log(`  -> Wrote doc data to ${docPath}`);
    }
  }

  const defaultExport = source
    .getDefaultExportSymbol()
    ?.getDeclarations?.()?.[0];

  if (
    defaultExport &&
    defaultExport.isKind(SyntaxKind.ClassDeclaration) &&
    !classes.includes(defaultExport as ClassDeclaration) // S'il n'a pas déjà été traité
  ) {
    const doc = getComponentDoc(defaultExport as ClassDeclaration, source);
    if (doc) {
      const componentDir = path.dirname(source.getFilePath());
      const docPath = path.join(componentDir, `${doc.name}.doc.json`);
      fs.writeJsonSync(docPath, doc, { spaces: 2 });
      console.log(`  -> Wrote doc data to ${docPath}`);
    }
  }
}

function parseAttribute(tag: JsDocTag, memberInfo: JsDocInfo): any {
  const [attrNameBase, ...descParts] = tag.comment.split(' - ');
  /**
   * @type {string}
   */
  const attrName = attrNameBase;

  const type = attrName.match(/\{(.*?)\}/)?.[0] ?? 'unknown';

  const optional = (attrName.match(/\((optional)\)/g)?.length ?? 0) > 0;

  const defaultValue =
    attrName.match(/\(default:\s*([^)]+)\)/)?.[0] || 'undefined';

  return {
    name: attrName.split(' ').pop()?.trim() || '',
    description: descParts.join(' - ').trim() || memberInfo.description,
    default:
      defaultValue.replace('(default:', '').replace(')', '').trim() || '',
    type: type.replace('{', '').replace('}', '').trim(),
    optional,
  };
}

/**
 * Analyse une classe de composant de manière récursive (en suivant l'héritage)
 * et retourne l'objet de documentation fusionné.
 * Utilise un cache pour éviter de re-parser les classes de base.
 */
function getComponentDoc(
  classNode: ClassDeclaration,
  sourceFile: SourceFile,
): ComponentDoc | null {
  if (!classNode || !classNode.isKind(SyntaxKind.ClassDeclaration)) {
    return null;
  }

  const componentName = classNode.getName() || '';
  const cacheKey = componentName;

  // --- 0. Vérifier le cache ---
  if (docCache.has(cacheKey)) {
    return docCache.get(cacheKey)!;
  }

  console.log(`Processing: ${componentName}`);

  // --- 1. RECURSION: Get Parent Doc First ---
  let parentDoc: ComponentDoc | null = null;
  const baseClass = classNode.getBaseClass();
  if (baseClass) {
    const baseClassName = baseClass.getName();
    // On arrête la récursion à BnumElement ou HTMLElement
    if (
      baseClassName &&
      baseClassName !== 'BnumElement' &&
      baseClassName !== 'HTMLElement'
    ) {
      const baseSourceFile = baseClass.getSourceFile();
      console.log(`  -> Found parent: ${baseClassName}. Parsing...`);
      parentDoc = getComponentDoc(baseClass, baseSourceFile); // Appel récursif
    }
  }

  // --- 2. Initialiser le Doc de l'enfant ---
  const componentDir = path.dirname(sourceFile.getFilePath());
  const doc: ComponentDoc = {
    name: '',
    description: '',
    structure: [],
    properties: [],
    dataAttributes: [],
    events: [],
    slots: [],
    cssVars: [],
    publicMethods: [],
    publicProperties: [],
    states: [],
  };

  // --- 3. Analyser le TSDoc de la CLASSE (Description, Slots, CSS Vars) ---
  const classInfo = getJsDocInfo(classNode);
  doc.description = classInfo.description;

  classInfo.tags.forEach((tag) => {
    if (tag.tagName === 'slot') {
      const [slotName, ...descParts] = tag.comment.split(' - ');
      doc.slots.push({
        name: slotName.trim(),
        description: descParts.join(' - ').trim(),
      });
    }
    if (tag.tagName === 'cssvar') {
      const cssDefault = tag.comment.match(regexBraces)?.[0] ?? '/';
      const [varName, ...descParts] = tag.comment
        .replaceAll(cssDefault, '')
        .split(' - ');
      doc.cssVars.push({
        name: varName.trim(),
        default: cssDefault.replaceAll('{', '').replaceAll('}', ''),
        description: descParts.join(' - ').trim(),
      });
    }
    if (tag.tagName === 'structure') {
      const lines = tag.comment.split('\n');
      const title = lines[0].trim();
      const code = lines
        .slice(1)
        .join('\n')
        .trim()
        .replaceAll('<bnum-', '<' + BnumConfig.Get('tag_prefix')! + '-')
        .replaceAll('</bnum-', '</' + BnumConfig.Get('tag_prefix')! + '-');
      doc.structure.push({
        title: title.length > 0 ? title : '',
        code: code,
      });
    }

    if (tag.tagName === 'state') {
      const [stateName, ...descParts] = tag.comment.split(' - ');
      doc.states.push({
        name: stateName.trim(),
        description: descParts.join(' - ').trim(),
      });
    }
  });

  // --- 4. Analyser le TSDoc des MEMBRES STATIQUES (Props, Events, Attrs) ---
  classNode.getStaticMembers().forEach((member) => {
    const memberInfo = getJsDocInfo(member);
    if (memberInfo.tags.length === 0) return;

    memberInfo.tags.forEach((tag) => {
      if (tag.tagName === 'prop') {
        const typeMatch = tag.comment.match(/\{(.*?)\}/);
        const [propName, ...descParts] = tag.comment
          .replace(/\{.*?\}/, '')
          .split(' - ');
        doc.properties.push({
          name: propName.trim() || member.getName(),
          type: formatType(typeMatch ? typeMatch[1] : 'any'),
          description: descParts.join(' - ').trim() || memberInfo.description,
          default: '',
          required: false,
          dynamic: true,
        });
      }
      if (tag.tagName === 'event') {
        const detailTag = memberInfo.tags.find((t) => t.tagName === 'detail');
        doc.events.push({
          name: tag.comment.trim() || member.getName(),
          detail: detailTag ? detailTag.comment : '{}',
          description: memberInfo.description,
        });
      }
      if (tag.tagName === 'attr') {
        doc.dataAttributes.push(parseAttribute(tag, memberInfo));
      }
    });
  });

  // --- 5. Trouver le nom de la balise (TAG) ---
  const tagGetter = classNode.getStaticMember('TAG');
  let tagName: string | null = null;
  if (tagGetter && tagGetter.isKind(SyntaxKind.GetAccessor)) {
    const returnStatement = tagGetter
      .getBody()
      ?.getFirstDescendantByKind(SyntaxKind.ReturnStatement);

    if (returnStatement) {
      const expression = returnStatement.getExpression();
      if (expression && expression.isKind(SyntaxKind.StringLiteral)) {
        const literalValue = expression.getLiteralValue();
        if (literalValue.includes('-')) {
          tagName = literalValue;
        }
      } else if (
        expression &&
        expression.isKind(SyntaxKind.TemplateExpression)
      ) {
        // Récupère la partie "head" (texte avant la première interpolation)
        const head = expression.getHead().getText().slice(1, -1); // retire les backticks

        // Récupère les spans (chaque interpolation + texte qui suit)
        const spans = expression.getTemplateSpans();

        let evaluated = head;
        for (const span of spans) {
          // Expression interpolée (ex: mavar)
          const expr = span.getExpression();
          let value = '';
          if (expr.isKind(SyntaxKind.Identifier)) {
            // Essaie de retrouver la valeur de l'identifiant (ex: mavar)
            const symbol = expr.getSymbol();
            if (symbol) {
              const decl = symbol.getDeclarations()[0];
              if (decl && decl.isKind(SyntaxKind.VariableDeclaration)) {
                const init = decl.getInitializer();
                if (init && init.isKind(SyntaxKind.StringLiteral)) {
                  value = init.getLiteralValue();
                }
              }
            }
          }
          // Ajoute la valeur interpolée + le texte qui suit
          evaluated += value + span.getLiteral().getText().slice(0, -1); // retire le dernier backtick si présent
        }
        tagName = evaluated;
      } else if (expression && expression.isKind(SyntaxKind.Identifier)) {
        const symbol = expression.getSymbol();
        if (symbol) {
          const originalSymbol = symbol.getAliasedSymbol() || symbol;
          const declarations = originalSymbol.getDeclarations();
          if (declarations.length > 0) {
            const declaration = declarations[0];
            if (declaration.isKind(SyntaxKind.VariableDeclaration)) {
              const initializer = declaration.getInitializer();
              if (initializer && initializer.isKind(SyntaxKind.StringLiteral)) {
                tagName = initializer.getLiteralValue();
              }
            }
          }
        }
      }
    }
  }

  doc.name =
    BnumConfig.Get('tag_prefix')! +
    '-' +
    path
      .basename(sourceFile.getFilePath())
      .replace('bnum-', EMPTY_STRING)
      .replace('.ts', EMPTY_STRING); // Valeur par défaut

  // --- 6. Analyser les MÉTHODES (Instance + Statique) ---
  classNode.getMethods().forEach((method: MethodDeclaration) => {
    const name = method.getName();
    if (
      method.getScope() === Scope.Private ||
      method.getScope() === Scope.Protected ||
      name.startsWith('_p_') ||
      name.startsWith('_') ||
      name.startsWith('#') ||
      [
        'constructor',
        'connectedCallback',
        'disconnectedCallback',
        'attributeChangedCallback',
        'render',
        'TAG',
        'TryDefine',
        'TryDefineElement',
      ].includes(name)
    ) {
      return;
    }
    const info = getJsDocInfo(method);
    if (!info.description && info.tags.length === 0) return;
    const paramTags = info.tags.filter((t) => t.tagName === 'param');
    const parameters = method.getParameters().map((param, i) => {
      const paramName = param.getName();
      const paramTag = paramTags[i]; //.find((t) => t.comment);
      const description = paramTag ? parseParamTag(paramTag.comment).name : '';

      return {
        name: paramName,
        type: formatType(param.getType().getText()),
        description: description,
      };
    });
    const returnTag = info.tags.find(
      (t) => t.tagName === 'returns' || t.tagName === 'return',
    );
    doc.publicMethods.push({
      name: name,
      description: info.description,
      parameters: parameters,
      return: {
        type: formatType(method.getReturnType().getText()),
        description: returnTag ? returnTag.comment : '',
      },
      isStatic: method.isStatic(),
    });
  });

  // --- 7. Analyser les PROPRIÉTÉS (Instance + Statique + Get/Set) ---
  const accessors = classNode
    .getMembers()
    .filter(
      (m) =>
        m.isKind(SyntaxKind.GetAccessor) || m.isKind(SyntaxKind.SetAccessor),
    );
  const accessorMap = new Map<string, any>();
  accessors.forEach((accessor: any) => {
    const name = accessor.getName();
    if (
      accessor.getScope() === Scope.Private ||
      accessor.getScope() === Scope.Protected ||
      name.startsWith('_p_') ||
      name.startsWith('_')
    )
      return;
    const info = getJsDocInfo(accessor);
    if (!info.description) return;
    if (!accessorMap.has(name))
      accessorMap.set(name, { name, description: info.description });
    if (accessor.isKind(SyntaxKind.GetAccessor)) {
      accessorMap.get(name).type = formatType(
        accessor.getReturnType().getText(),
      );
      accessorMap.get(name).isReadonly = false;
    }
    if (accessor.isKind(SyntaxKind.SetAccessor)) {
      if (accessorMap.has(name)) accessorMap.get(name).isReadonly = false;
    }
    accessorMap.get(name).isStatic = accessor.isStatic();
  });
  accessorMap.forEach((prop, name) => {
    const hasSetter = classNode
      .getMembers()
      .some((m) => m.isKind(SyntaxKind.SetAccessor) && m.getName() === name);
    if (!hasSetter) prop.isReadonly = true;
    doc.publicProperties.push({ ...prop, isStatic: prop.isStatic });
  });

  classNode.getProperties().forEach((prop: PropertyDeclaration) => {
    const name = prop.getName();
    if (
      prop.getScope() === Scope.Private ||
      prop.getScope() === Scope.Protected ||
      name.startsWith('_p_') ||
      name.startsWith('_') ||
      name.startsWith('#')
    )
      return;
    const info = getJsDocInfo(prop);
    if (
      !info.description ||
      info.tags.some((t) => ['prop', 'event', 'attr'].includes(t.tagName))
    )
      return;

    doc.publicProperties.push({
      name: name,
      type: formatType(prop.getType().getText()),
      description: info.description,
      isStatic: prop.isStatic(),
      isReadonly: prop.isReadonly(),
    });
  });

  // --- 8. MERGE Parent Doc dans Child Doc ---
  if (parentDoc) {
    console.log(
      `  -> Merging docs from ${baseClass!.getName()} into ${componentName}`,
    );

    // La description de l'enfant gagne. Si vide, on prend celle du parent.
    doc.description = doc.description || parentDoc.description;

    // Le TAG est déjà géré (l'enfant gagne, sinon parent, sinon fallback)

    // Fusionner les listes
    doc.structure = doc.structure.length ? doc.structure : parentDoc.structure; // [...parentDoc.structure, ...doc.structure];

    // Fusionner les listes avec écrasement (l'enfant gagne)
    doc.properties = mergeDocArray(parentDoc.properties, doc.properties);
    doc.dataAttributes = mergeDocArray(
      parentDoc.dataAttributes,
      doc.dataAttributes,
    );
    doc.events = mergeDocArray(parentDoc.events, doc.events);
    doc.slots = mergeDocArray(parentDoc.slots, doc.slots);
    doc.cssVars = mergeDocArray(parentDoc.cssVars, doc.cssVars);
    doc.publicMethods = mergeDocArray(
      parentDoc.publicMethods,
      doc.publicMethods,
    );
    doc.publicProperties = mergeDocArray(
      parentDoc.publicProperties,
      doc.publicProperties,
    );
    doc.states = mergeDocArray(parentDoc.states, doc.states);
  }

  // --- 9. Mettre en cache et retourner ---
  docCache.set(cacheKey, doc);
  return doc;
}

// --- Point d'entrée du script ---
function main(): void {
  console.log('Starting documentation generation...');

  const project = new Project();

  const filePaths = globSync('components/**/*.ts', {
    cwd: PROJECT_ROOT,
    ignore: [
      'components/**/bnum-element.ts', // On ignore le fichier de base
      'components/**/bnum-element-states.ts',
      'components/**/*.doc.ts',
      'components/**/*.playground.js',
    ],
    absolute: true,
  });

  console.log(`Found ${filePaths.length} component files.`);

  // Ajoute tous les fichiers au projet pour que TS-Morph puisse résoudre les imports/héritages
  project.addSourceFilesAtPaths(filePaths);

  // Traite chaque fichier trouvé
  for (const sourceFile of project.getSourceFiles()) {
    // S'assurer qu'on ne traite que les fichiers de notre glob initial
    // (et pas les dépendances importées comme @rotomeca/utils)
    if (filePaths.includes(path.normalize(sourceFile.getFilePath()))) {
      parseComponents(sourceFile);
    }
  }

  console.log('Documentation generation complete.');
}

main();
