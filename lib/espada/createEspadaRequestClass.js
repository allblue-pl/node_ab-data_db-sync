import { ABDField, abdFields as f, RequestDef } from "ab-data";
import abLog from "ab-log";
import fs from "fs";
import path from "path";
                                                           
import abDataDefToPHPStan from "./abDataDefToPHPStan.js";
import { abDataDefTypes as t } from "ab-data";
import { table } from "console";
import helper from "ab-data/lib/helper.js";
import { getETable } from "./helpers.js";

function createEspadaRequestClass(scheme            , packagePath        , 
        namespace        , requestName        , requestDef            )       {
    
    try {
        createClass(scheme, packagePath, namespace, requestName, requestDef);
    } catch (e) {
        console.error(abLog.cError(
                `Error creating espada request '${namespace}:${requestName}'.`), 
                e);
    }
};
export default createEspadaRequestClass;


function createClass(scheme            , packagePath        , namespace        , 
        requestName        , requestDef            )       {
    let tableNames                = [];
    let actionNames = requestDef.getActionNames();

    let content = "";

    for (let actionName of actionNames) {
        let actionDef = requestDef.getActionDef(actionName);

        content += `
 *
 * @phpstan-type _T_R${requestName}_${actionName}_Args array{
`       ;

        content += getPHPStanFromDef(scheme, actionDef.argsDef, tableNames);

        content += ` * }
 * @phpstan-type _T_R${requestName}_${actionName}_Success_Raw array{
 *     _debug?: string,
 *     _message?: string,
`      
        ;

        content += getPHPStanFromDef(scheme, actionDef.successDef, tableNames);

        content += ` * }
 * @phpstan-type _T_R${requestName}_${actionName}_Success array{
 *     _debug?: string,
 *     _type: 0|1,
 *     _message: string,
`;
        content += getPHPStanFromDef(scheme, actionDef.successDef, tableNames);

        content += ` * }`;

    content += `
 * @phpstan-type _T_R${requestName}_${actionName}_Failure_Raw array{
 *     _debug?: string,
 *     _message?: string,
`      
        ;

        content += getPHPStanFromDef(scheme, actionDef.failureDef, tableNames);

        content += ` * }
 * @phpstan-type _T_R${requestName}_${actionName}_Failure array{
 *     _debug?: string,
 *     _type: 0|1,
 *     _message: string,
`;
        content += getPHPStanFromDef(scheme, actionDef.failureDef, tableNames);

        content += ` * }`;

    content += `
 * @phpstan-type _T_R${requestName}_${actionName}_Result_Raw _T_R${requestName}_${actionName}_Success_Raw|_T_R${requestName}_${actionName}_Failure_Raw
 * @phpstan-type _T_R${requestName}_${actionName}_Result _T_R${requestName}_${actionName}_Success|_T_R${requestName}_${actionName}_Failure
        `;
    }

    content += `
 */
abstract class _R${requestName} extends RRequest {`
    ;

    for (let actionName of actionNames) {
        content += `
    /**
     * @param _T_R${requestName}_${actionName}_Failure_Raw $result 
     * @return _T_R${requestName}_${actionName}_Failure
     */
    static function ${actionName}_Failure(array $result): array {
        $result["_type"] = 1;
        $result["_message"] = array_key_exists("_message", $result) ?
                $result["_message"] : "";

        return $result;
    }

    /**
     * @param _T_R${requestName}_${actionName}_Success_Raw $result 
     * @return _T_R${requestName}_${actionName}_Success
     */
    static function ${actionName}_Success(array $result): array {
        $result["_type"] = 0;
        $result["_message"] = array_key_exists("_message", $result) ?
                $result["_message"] : "";

        return $result;
    }
`;
    }

    content += `
    public function __construct(CDataStore $dataStore) {
        parent::__construct($dataStore);`;

    for (let actionName of actionNames) {
        let actionDef = requestDef.getActionDef(actionName);

        content += `

        $this->setAction('${actionName}', "${actionDef.type}", function(?CDevice $device, array $args,
                ?int $schemeVersion, ?float $lastUpdate): array {
            /** @phpstan-ignore argument.type */
            return $this->action_${actionName}(` + (actionDef.type === "w" ? "$device, " : "") + `$args);
        });`;
    }

    content += `
    }    
`
    ;

    for (let actionName of actionNames) {
        let actionDef = requestDef.getActionDef(actionName);

        content += `
    /**
     * @param _T_R${requestName}_${actionName}_Args $args
     * @return _T_R${requestName}_${actionName}_Result
     */
    abstract public function action_${actionName}(` + (actionDef.type === "w" ? "CDevice $device, " : "") + `array $args): array;
`;
    }

    content += `}`;

    let content_Start =
`<?php namespace EC\\${namespace}\\_Requests;
defined('_ESPADA') or die(NO_ACCESS);

use E, EC;
use EC\\ABData\\CDataStore;
use EC\\ABData\\CDevice;
use EC\\ABData\\RRequest;

/**`
    ;

    for (let tableName of tableNames) {
        if (!scheme.hasTable(tableName)) {
            throw new Error(`Table '${tableName}' requested in request '${requestName}' ` + 
                    `does not exist in data schema.`);
        }

        let eTable = getETable(scheme.getTableDef(tableName));

        content_Start += `
 * @phpstan-import-type _T_R${eTable.fullName} from EC\\${eTable.packageName}\\_Tables\\_T${eTable.name}`
        ;
    }

    content = content_Start + content;

    fs.writeFileSync(path.join(packagePath, namespace, "classes", "_Requests", 
            `_R${requestName}.php`), content.replaceAll("\n", "\r\n"));
    // abLog.success(`Saved Request: ${requestName}.`);
};

function getPHPStanFromDef(scheme            , def                 , 
        tableNames               )         {
    return abDataDefToPHPStan.parsePreset(scheme, def, " *     ");
}