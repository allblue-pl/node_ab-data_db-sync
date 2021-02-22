'use strict';

const
    fs = require('fs'),
    path = require('path'),

    abLog = require('ab-log')
;


let createClass_Async = async (packagesPath, tableInfo) => {
    let table = getTable(tableInfo);

    let packagePath = findPackage(packagesPath, table);
    if (packagePath === null) {
        abLog.warn(`Cannot find tables '${table.fullName}' package. Skipping.`);
        return;
    }

    createClass(packagePath, table);
    // createClass_Child(packagePath, table);
};
module.exports = createClass_Async;


let createClass = (packagePath, table) => {
    let content = '';
    content += 
`<?php namespace EC\\${table.packageName};
defined('_ESPADA') or die(NO_ACCESS);

use E, EC,
    EC\\Database;

class _T${table.name} extends Database\\TTable
{

    public function __construct(EC\\MDatabase $db, $tablePrefix = 't')
    {
        parent::__construct($db, '${table.fullName}', $tablePrefix);

        $this->setColumns([`
    ;

    for (let fieldInfo of table.info.fieldInfos) {
        content += `
            ` + getFieldDeclaration(fieldInfo);
        ;
    }

    content += `
        ]);
    }

}
`
    ;

    fs.writeFileSync(path.join(packagePath, `classes`, `_T${table.name}.php`), content);
    abLog.success(`Saved: ${table.fullName}.`);
};


let createClass_Child = (packagePath, table) => {
    let childClassPath = path.join(packagePath, `classes`, `T${table.name}.php`);
    if (fs.existsSync(childClassPath))
        return;

    let tablePrefix = '';
    for (let i = 0; i < table.packageName.length; i++) {
        if (table.packageName[i] === table.packageName[i].toUpperCase())
            tablePrefix += table.packageName[i].toLowerCase();
    }
    tablePrefix += '_';
    for (let i = 0; i < table.name.length; i++) {
        if (table.name[i] === table.name[i].toUpperCase())
            tablePrefix += table.name[i].toLowerCase();
    }

    let content = '';
    content += 
`<?php namespace EC\\${table.packageName};
defined('_ESPADA') or die(NO_ACCESS);

use E, EC,
    EC\\Database;

class T${table.name} extends _T${table.name}
{

    public function __construct(EC\\MDatabase $db)
    {
        parent::__construct($db, '${tablePrefix}');
    }

}
`
    ;

    fs.writeFileSync(childClassPath, content);
    abLog.success(`Created child for: ${table.fullName}.`);
};


let findPackage = (packagePaths, table) => {
    for (let packagePath of packagePaths) {
        let dirs = fs.readdirSync(packagePath);
        for (let dir of dirs) {
            if (dir === table.packageName)
                return path.join(packagePath, dir);
        }
    }

    return null;
};

function getFieldDeclaration(fieldInfo)
{
    return `'${fieldInfo.name}' => new Database\\F` + fieldInfo.field.getType() + '(' + 
            (fieldInfo.notNull ? 'true' : 'false') + (fieldInfo.field.args.length > 0 ? 
            (', ' + fieldInfo.field.args.join(', ')) : '') + '),';
}

function getFieldType(field)
{
    let match = /^(.+?)(\((.+?)\)( .+)?)?$/.exec(field.type);
    let notNull = field.notNull;
    
    if (match[1] === 'tinyint' && match[3] === '1')
        return `Bool(${notNull})`;
    else if (match[1] === 'bigint')
        return `Long(${notNull})`;
    else if(match[1] === 'blob')
        return `Blob(${notNull}, 'regular')`;
    else if (match[1] === 'date')
        return `Date(${notNull})`;
    else if (match[1] === 'datetime')
        return `DateTime(${notNull})`;
    else if (match[1] === 'float')
        return `Float(${notNull})`;
    else if (match[1] === 'number')
        return `Float(${notNull})`;
    else if (match[1] === 'int')
        return `Int(${notNull})`;
    else if(match[1] === 'tinyblob')
        return `Blob(${notNull}, 'tiny')`;
    else if(match[1] === 'tinytext')
        return `Text(${notNull}, 'tiny')`;
    else if(match[1] === 'text')
        return `Text(${notNull}, 'regular')`;
    else if(match[1] === 'mediumtext')
        return `Text(${notNull}, 'medium')`;
    else if(match[1] === 'mediumblob')
        return `Blob(${notNull}, 'medium')`;
    else if(match[1] === 'varchar')
        return `Varchar(${notNull}, ${match[3]})`;

    abLog.warn(`Unknown field:`, field);
    throw new Error('Unknown field');
}

function getTable(tableInfo)
{
    let tableName_Arr = tableInfo.name.split('_');

    return {
        packageName: tableName_Arr[0],
        fullName: tableInfo.name,
        name: tableName_Arr.slice(1).join('_'),
        info: tableInfo,
    };
};