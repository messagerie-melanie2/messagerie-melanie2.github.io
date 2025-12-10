'use strict';

var tsMorph = require('ts-morph');
var fs = require('fs-extra');
var path = require('path');
var glob = require('glob');
var utils = require('@rotomeca/utils');

function _interopDefaultLegacy (e) { return e && typeof e === 'object' && 'default' in e ? e : { 'default': e }; }

var fs__default = /*#__PURE__*/_interopDefaultLegacy(fs);
var path__default = /*#__PURE__*/_interopDefaultLegacy(path);

var LogEnum;
(function (LogEnum) {
    LogEnum[LogEnum["TRACE"] = 0] = "TRACE";
    LogEnum[LogEnum["DEBUG"] = 1] = "DEBUG";
    LogEnum[LogEnum["INFO"] = 2] = "INFO";
    LogEnum[LogEnum["WARN"] = 3] = "WARN";
    LogEnum[LogEnum["ERROR"] = 4] = "ERROR";
})(LogEnum || (LogEnum = {}));

const DEFAULT_CONFIG = {
    local_keys: {
        today: 'Aujourd\'hui',
        tomorrow: 'Demain',
        day: 'Journée',
        invalid_date: 'Date invalide',
    },
    console_logging: true,
    console_logging_level: LogEnum.TRACE,
    tag_prefix: 'bnum',
};

/**
 * Vérifie si une valeur est un objet (et pas un tableau).
 * @param item Item à vérifier
 * @returns Vrai si l'item est un objet (et pas un tableau), sinon faux.
 */
function isObject(item) {
    return item && typeof item === 'object' && !Array.isArray(item);
}
/**
 * Fonction de fusion profonde (Deep Merge) native.
 * @param target L'objet cible (qui sera modifié).
 * @param source L'objet source (qui écrase la cible).
 * @returns L'objet cible fusionné.
 */
function deepMerge(target, source) {
    // Si l'un des deux n'est pas un objet, on retourne la source (écrasement)
    if (!isObject(target) || !isObject(source)) {
        return source;
    }
    const output = target;
    Object.keys(source).forEach((key) => {
        const targetValue = output[key];
        const sourceValue = source[key];
        if (Array.isArray(targetValue) && Array.isArray(sourceValue)) {
            // Choix architectural : Pour les tableaux de config, on remplace souvent tout le tableau.
            // Si tu préfères concaténer : output[key] = targetValue.concat(sourceValue);
            output[key] = sourceValue;
        }
        else if (isObject(targetValue) && isObject(sourceValue)) {
            // Récursion pour les objets imbriqués
            output[key] = deepMerge(targetValue, sourceValue);
        }
        else {
            // Assignation directe pour les primitives
            output[key] = sourceValue;
        }
    });
    return output;
}
// Variable locale au module (privée) pour stocker l'état
let _currentConfig = { ...DEFAULT_CONFIG };
/**
 * Gestionnaire de configuration global pour Bnum.
 */
class BnumConfig {
    /**
     * Initialise la configuration en fusionnant les défauts avec un objet partiel.
     * À appeler au démarrage si une config globale existe.
     */
    static Initialize(overrides) {
        _currentConfig = deepMerge(_currentConfig, overrides);
    }
    static Get(key) {
        if (key) {
            return _currentConfig[key];
        }
        return _currentConfig;
    }
    /**
     * Met à jour la configuration à la volée.
     */
    static Set(overrides) {
        this.Initialize(overrides);
        // Optionnel : Déclencher un événement global pour dire que la config a changé
        // document.dispatchEvent(new CustomEvent('bnum:config-changed', { detail: _currentConfig }));
    }
    /**
     * Reset la configuration aux valeurs par défaut
     */
    static Reset() {
        _currentConfig = { ...DEFAULT_CONFIG };
    }
    /**
     * Récupère une copie profonde de la configuration actuelle.
     * @readonly
     */
    static get Clone() {
        return JSON.parse(JSON.stringify(_currentConfig));
    }
}

const PROJECT_ROOT = process.cwd();
const regexBraces = /\{([^}]*)\}/g;
/**
 * Cache global pour les documents de composants déjà parsés.
 * Clé = Nom de la classe (string), Valeur = doc (object)
 */
const docCache = new Map();
/**
 * Fusionne deux listes de documentation (props, events, etc.)
 * en s'assurant que les éléments de 'child' écrasent 'parent' s'ils ont le même 'name'.
 */
function mergeDocArray(parentArr = [], childArr = []) {
    if (!parentArr || parentArr.length === 0)
        return childArr || [];
    if (!childArr || childArr.length === 0)
        return parentArr || [];
    const mergedMap = new Map();
    // 1. Ajouter tous les parents
    for (const item of parentArr) {
        if (item.name)
            mergedMap.set(item.name, item);
    }
    // 2. Ajouter/Écraser avec les enfants
    for (const item of childArr) {
        if (item.name)
            mergedMap.set(item.name, item);
    }
    return Array.from(mergedMap.values());
}
/**
 * Extrait les infos TSDoc (description + tags).
 */
function getJsDocInfo(node) {
    // @ts-ignore
    const jsDoc = node.getJsDocs()[0];
    if (!jsDoc) {
        return { description: '', tags: [] };
    }
    const description = jsDoc.getDescription().trim();
    const tags = jsDoc.getTags().map((tag) => ({
        tagName: tag.getTagName(),
        comment: (tag.getCommentText() || '').trim(),
    }));
    return { description, tags };
}
/**
 * Parse un tag @param ou @returns.
 */
function parseParamTag(comment) {
    const [name, ...descParts] = comment.split(' - ');
    return {
        name: name.trim(),
        description: descParts.join(' - ').trim(),
    };
}
function formatType(type) {
    return type.replace(/import\((['"])[/\w-_\d]+\1\)\./g, '').trim();
}
/**
 * Point d'entrée pour l'analyse d'un fichier source.
 * Itère sur les classes et écrit les fichiers de doc.
 */
function parseComponents(source) {
    const classes = source.getClasses();
    for (const classNode of classes) {
        const doc = getComponentDoc(classNode, source);
        if (doc) {
            const componentDir = path__default["default"].dirname(source.getFilePath());
            const docPath = path__default["default"].join(componentDir, `${doc.name}.doc.json`);
            fs__default["default"].writeJsonSync(docPath, doc, { spaces: 2 });
            console.log(`  -> Wrote doc data to ${docPath}`);
        }
    }
    const defaultExport = source
        .getDefaultExportSymbol()
        ?.getDeclarations?.()?.[0];
    if (defaultExport &&
        defaultExport.isKind(tsMorph.SyntaxKind.ClassDeclaration) &&
        !classes.includes(defaultExport) // S'il n'a pas déjà été traité
    ) {
        const doc = getComponentDoc(defaultExport, source);
        if (doc) {
            const componentDir = path__default["default"].dirname(source.getFilePath());
            const docPath = path__default["default"].join(componentDir, `${doc.name}.doc.json`);
            fs__default["default"].writeJsonSync(docPath, doc, { spaces: 2 });
            console.log(`  -> Wrote doc data to ${docPath}`);
        }
    }
}
function parseAttribute(tag, memberInfo) {
    const [attrNameBase, ...descParts] = tag.comment.split(' - ');
    /**
     * @type {string}
     */
    const attrName = attrNameBase;
    const type = attrName.match(/\{(.*?)\}/)?.[0] ?? 'unknown';
    const optional = (attrName.match(/\((optional)\)/g)?.length ?? 0) > 0;
    const defaultValue = attrName.match(/\(default:\s*([^)]+)\)/)?.[0] || 'undefined';
    return {
        name: attrName.split(' ').pop()?.trim() || '',
        description: descParts.join(' - ').trim() || memberInfo.description,
        default: defaultValue.replace('(default:', '').replace(')', '').trim() || '',
        type: type.replace('{', '').replace('}', '').trim(),
        optional,
    };
}
/**
 * Analyse une classe de composant de manière récursive (en suivant l'héritage)
 * et retourne l'objet de documentation fusionné.
 * Utilise un cache pour éviter de re-parser les classes de base.
 */
function getComponentDoc(classNode, sourceFile) {
    if (!classNode || !classNode.isKind(tsMorph.SyntaxKind.ClassDeclaration)) {
        return null;
    }
    const componentName = classNode.getName() || '';
    const cacheKey = componentName;
    // --- 0. Vérifier le cache ---
    if (docCache.has(cacheKey)) {
        return docCache.get(cacheKey);
    }
    console.log(`Processing: ${componentName}`);
    // --- 1. RECURSION: Get Parent Doc First ---
    let parentDoc = null;
    const baseClass = classNode.getBaseClass();
    if (baseClass) {
        const baseClassName = baseClass.getName();
        // On arrête la récursion à BnumElement ou HTMLElement
        if (baseClassName &&
            baseClassName !== 'BnumElement' &&
            baseClassName !== 'HTMLElement') {
            const baseSourceFile = baseClass.getSourceFile();
            console.log(`  -> Found parent: ${baseClassName}. Parsing...`);
            parentDoc = getComponentDoc(baseClass, baseSourceFile); // Appel récursif
        }
    }
    // --- 2. Initialiser le Doc de l'enfant ---
    path__default["default"].dirname(sourceFile.getFilePath());
    const doc = {
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
                .replaceAll('<bnum-', '<' + BnumConfig.Get('tag_prefix') + '-')
                .replaceAll('</bnum-', '</' + BnumConfig.Get('tag_prefix') + '-');
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
        if (memberInfo.tags.length === 0)
            return;
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
    if (tagGetter && tagGetter.isKind(tsMorph.SyntaxKind.GetAccessor)) {
        const returnStatement = tagGetter
            .getBody()
            ?.getFirstDescendantByKind(tsMorph.SyntaxKind.ReturnStatement);
        if (returnStatement) {
            const expression = returnStatement.getExpression();
            if (expression && expression.isKind(tsMorph.SyntaxKind.StringLiteral)) {
                const literalValue = expression.getLiteralValue();
                if (literalValue.includes('-')) ;
            }
            else if (expression &&
                expression.isKind(tsMorph.SyntaxKind.TemplateExpression)) {
                // Récupère la partie "head" (texte avant la première interpolation)
                const head = expression.getHead().getText().slice(1, -1); // retire les backticks
                // Récupère les spans (chaque interpolation + texte qui suit)
                const spans = expression.getTemplateSpans();
                let evaluated = head;
                for (const span of spans) {
                    // Expression interpolée (ex: mavar)
                    const expr = span.getExpression();
                    let value = '';
                    if (expr.isKind(tsMorph.SyntaxKind.Identifier)) {
                        // Essaie de retrouver la valeur de l'identifiant (ex: mavar)
                        const symbol = expr.getSymbol();
                        if (symbol) {
                            const decl = symbol.getDeclarations()[0];
                            if (decl && decl.isKind(tsMorph.SyntaxKind.VariableDeclaration)) {
                                const init = decl.getInitializer();
                                if (init && init.isKind(tsMorph.SyntaxKind.StringLiteral)) {
                                    value = init.getLiteralValue();
                                }
                            }
                        }
                    }
                    // Ajoute la valeur interpolée + le texte qui suit
                    evaluated += value + span.getLiteral().getText().slice(0, -1); // retire le dernier backtick si présent
                }
            }
            else if (expression && expression.isKind(tsMorph.SyntaxKind.Identifier)) {
                const symbol = expression.getSymbol();
                if (symbol) {
                    const originalSymbol = symbol.getAliasedSymbol() || symbol;
                    const declarations = originalSymbol.getDeclarations();
                    if (declarations.length > 0) {
                        const declaration = declarations[0];
                        if (declaration.isKind(tsMorph.SyntaxKind.VariableDeclaration)) {
                            const initializer = declaration.getInitializer();
                            if (initializer && initializer.isKind(tsMorph.SyntaxKind.StringLiteral)) {
                                initializer.getLiteralValue();
                            }
                        }
                    }
                }
            }
        }
    }
    doc.name =
        BnumConfig.Get('tag_prefix') +
            '-' +
            path__default["default"]
                .basename(sourceFile.getFilePath())
                .replace('bnum-', utils.EMPTY_STRING)
                .replace('.ts', utils.EMPTY_STRING); // Valeur par défaut
    // --- 6. Analyser les MÉTHODES (Instance + Statique) ---
    classNode.getMethods().forEach((method) => {
        const name = method.getName();
        if (method.getScope() === tsMorph.Scope.Private ||
            method.getScope() === tsMorph.Scope.Protected ||
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
            ].includes(name)) {
            return;
        }
        const info = getJsDocInfo(method);
        if (!info.description && info.tags.length === 0)
            return;
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
        const returnTag = info.tags.find((t) => t.tagName === 'returns' || t.tagName === 'return');
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
        .filter((m) => m.isKind(tsMorph.SyntaxKind.GetAccessor) || m.isKind(tsMorph.SyntaxKind.SetAccessor));
    const accessorMap = new Map();
    accessors.forEach((accessor) => {
        const name = accessor.getName();
        if (accessor.getScope() === tsMorph.Scope.Private ||
            accessor.getScope() === tsMorph.Scope.Protected ||
            name.startsWith('_p_') ||
            name.startsWith('_'))
            return;
        const info = getJsDocInfo(accessor);
        if (!info.description)
            return;
        if (!accessorMap.has(name))
            accessorMap.set(name, { name, description: info.description });
        if (accessor.isKind(tsMorph.SyntaxKind.GetAccessor)) {
            accessorMap.get(name).type = formatType(accessor.getReturnType().getText());
            accessorMap.get(name).isReadonly = false;
        }
        if (accessor.isKind(tsMorph.SyntaxKind.SetAccessor)) {
            if (accessorMap.has(name))
                accessorMap.get(name).isReadonly = false;
        }
        accessorMap.get(name).isStatic = accessor.isStatic();
    });
    accessorMap.forEach((prop, name) => {
        const hasSetter = classNode
            .getMembers()
            .some((m) => m.isKind(tsMorph.SyntaxKind.SetAccessor) && m.getName() === name);
        if (!hasSetter)
            prop.isReadonly = true;
        doc.publicProperties.push({ ...prop, isStatic: prop.isStatic });
    });
    classNode.getProperties().forEach((prop) => {
        const name = prop.getName();
        if (prop.getScope() === tsMorph.Scope.Private ||
            prop.getScope() === tsMorph.Scope.Protected ||
            name.startsWith('_p_') ||
            name.startsWith('_') ||
            name.startsWith('#'))
            return;
        const info = getJsDocInfo(prop);
        if (!info.description ||
            info.tags.some((t) => ['prop', 'event', 'attr'].includes(t.tagName)))
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
        console.log(`  -> Merging docs from ${baseClass.getName()} into ${componentName}`);
        // La description de l'enfant gagne. Si vide, on prend celle du parent.
        doc.description = doc.description || parentDoc.description;
        // Le TAG est déjà géré (l'enfant gagne, sinon parent, sinon fallback)
        // Fusionner les listes
        doc.structure = doc.structure.length ? doc.structure : parentDoc.structure; // [...parentDoc.structure, ...doc.structure];
        // Fusionner les listes avec écrasement (l'enfant gagne)
        doc.properties = mergeDocArray(parentDoc.properties, doc.properties);
        doc.dataAttributes = mergeDocArray(parentDoc.dataAttributes, doc.dataAttributes);
        doc.events = mergeDocArray(parentDoc.events, doc.events);
        doc.slots = mergeDocArray(parentDoc.slots, doc.slots);
        doc.cssVars = mergeDocArray(parentDoc.cssVars, doc.cssVars);
        doc.publicMethods = mergeDocArray(parentDoc.publicMethods, doc.publicMethods);
        doc.publicProperties = mergeDocArray(parentDoc.publicProperties, doc.publicProperties);
        doc.states = mergeDocArray(parentDoc.states, doc.states);
    }
    // --- 9. Mettre en cache et retourner ---
    docCache.set(cacheKey, doc);
    return doc;
}
// --- Point d'entrée du script ---
function main() {
    console.log('Starting documentation generation...');
    const project = new tsMorph.Project();
    const filePaths = glob.globSync('components/**/*.ts', {
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
        if (filePaths.includes(path__default["default"].normalize(sourceFile.getFilePath()))) {
            parseComponents(sourceFile);
        }
    }
    console.log('Documentation generation complete.');
}
main();
//# sourceMappingURL=generate-docs.js.map
