import { ABDField, ABDColumnRef, DataScheme, abdFields as f, TableDefVariant } from "ab-data";
                                                       
import abLog from "ab-log";
import fs from "fs";
import path from "path";
import { findPackage, getETable, getETableVariant,                                 } from "./helpers.js";
import abDataDefToPHPStan from "./abDataDefToPHPStan.js";
import { getFieldType, getPHPStanType } from "./createEspadaTableClass.js";

function createEspadaTableVariantClass(scheme            , packagePaths               ,
        tableDefVariant                 )       {
    let eTable = getETable(tableDefVariant.def);
    let eTableVariant = getETableVariant(tableDefVariant);

    let packagePath = findPackage(packagePaths, eTableVariant);
    if (packagePath === null) {
        abLog.warn(`Cannot find tables '${eTableVariant.fullName}' package. Skipping.`);
        return;
    }

    createClass(scheme, packagePath, eTableVariant, eTable);
    // createClass_Child(packagePath, table);
};
export default createEspadaTableVariantClass;


function createClass(scheme            , packagePath        , eTableVariant               ,
        eTable        )       {
    let content = '';
    content += 
`<?php namespace EC\\${eTableVariant.packageName}\\_TableVariants;
defined('_ESPADA') or die(NO_ACCESS);

use E, EC;
use EC\\ABData\\HABTablesHelper;
use EC\\Database;
use EC\\Database\\MDatabase;
use EC\\Database\\TTable;
use EC\\${eTable.packageName}\\_Tables\\_T${eTable.name};
use Override;

/**
 *
 * @phpstan-type _T_TVR${eTableVariant.fullName} array{`;

    for (let [ columnName, field ] of eTableVariant.tableVariant.columns) {
        let phpStanType = getPHPStanType(scheme, field);

        content += `
 *     ${columnName}: ${phpStanType},`;
    }

    for (let [ columnName, field ] of eTableVariant.tableVariant.columns_Extra) {
        let phpStanType = getPHPStanType(scheme, field);

        content += `
 *     ${columnName}?: ${phpStanType},`;
    }

    content += `
 * }
 */
abstract class _T${eTableVariant.name} extends _T${eTable.name} {
    /**
     *
     * @param _T_TVR${eTableVariant.fullName} $row
     * @return _T_TVR${eTableVariant.fullName}
     */
    static public function AssertRow(array $row): array {
        return $row;
    }

    /**
     *
     * @param list<_T_TVR${eTableVariant.fullName}> $rows
     * @return list<_T_TVR${eTableVariant.fullName}>
     */
    static public function AssertRows(array $rows): array {
        return $rows;
    }

    // /**
    //  *
    //  * @param array|null $row
    //  * @return _T_TVR${eTableVariant.fullName}|null
    //  */
    // static public function CastRow(array|null $row): array|null {
    //     /* phpstan-ignore return.type */
    //     return $row;
    // }

    // /**
    //  *
    //  * @param array $rows
    //  * @return list<_T_TVR${eTableVariant.fullName}>
    //  */
    // static public function CastRows(array $rows): array {
    //     return $rows;
    // }


    public function __construct(MDatabase $db, $tablePrefix = '${eTableVariant.tableVariant.def.alias}') {
        parent::__construct($db, $tablePrefix);
    }

    /** 
     * @return _T_TVR${eTableVariant.fullName}|null
     */
     #[Override]
    public function row_ByColumn(string $colName, mixed $colValue, 
            string $groupExtension = '', bool $forUpdate = false): array|null {
        /* @phpstan-ignore return.type */
        return parent::row_ByColumn($colName, $colValue, $groupExtension, $forUpdate);
    }

    /** 
     * @return _T_TVR${eTableVariant.fullName}|null
     */
    #[Override]
    public function row_ByPKs(array $keys, string $groupExtension = '', 
            bool $forUpdate = false): array|null {
        /* @phpstan-ignore return.type */
        return parent::row_ByPKs($keys, $groupExtension, $forUpdate);
    }

    /** 
     * @return _T_TVR${eTableVariant.fullName}|null
     */
    #[Override]
    public function row_Where(array $conditions = [], string $groupExtension = '',
            bool $forUpdate = false): array|null {
        /* @phpstan-ignore return.type */
        return parent::row_Where($conditions, $groupExtension, $forUpdate);
    }

    /** 
     * @return list<_T_TVR${eTableVariant.fullName}>
     * @phpstan-ignore method.childReturnType
     */
    #[Override]
    public function select_ByPKs(array $pks, string $groupExtension = ''): array {
        /* @phpstan-ignore return.type */
        return parent::select_ByPKs($pks, $groupExtension);
    }

    /** 
     * @return list<_T_TVR${eTableVariant.fullName}>
     * @phpstan-ignore method.childReturnType
     */
    #[Override]
    public function select_Where(array $conditions = [], string $groupExtension = '',
            bool $tableOnly = false): array {
        /* @phpstan-ignore return.type */
        return parent::select_Where($conditions, $groupExtension);
    }
}
`
    ;

    fs.writeFileSync(path.join(packagePath, "classes", "_TableVariants", `_T${eTableVariant.name}.php`), 
            content.replaceAll("\n", "\r\n"));
    abLog.success(`Saved Table: ${eTableVariant.fullName}.`);
};


// let createClass_Child = (packagePath, table) => {
//     let childClassPath = path.join(packagePath, `classes`, `T${table.name}.php`);
//     if (fs.existsSync(childClassPath))
//         return;

//     let tablePrefix = '';
//     for (let i = 0; i < table.packageName.length; i++) {
//         if (table.packageName[i] === table.packageName[i].toUpperCase())
//             tablePrefix += table.packageName[i].toLowerCase();
//     }
//     tablePrefix += '_';
//     for (let i = 0; i < table.name.length; i++) {
//         if (table.name[i] === table.name[i].toUpperCase())
//             tablePrefix += table.name[i].toLowerCase();
//     }

//     let content = '';
//     content += 
// `<?php namespace EC\\${table.packageName};
// defined('_ESPADA') or die(NO_ACCESS);

// use E, EC,
//     EC\\Database;

// class T${table.name} extends _T${table.name} {

//     public function __construct(EC\\MDatabase $db) {
//         parent::__construct($db, '${tablePrefix}');
//     }

// }
// `
//     ;

//     fs.writeFileSync(childClassPath, content);
//     abLog.success(`Created child for: ${table.fullName}.`);
// };