'use strict';

const
    path = require('path'),

    abMySQL = require('ab-mysql'),
    js0 = require('js0'),

    abData = require('ab-data')
;

class abData_DBSync_Class
{

    constructor()
    {

    }

    async createDatabaseInfo_Async(db)
    {
        let results = null;

        let databaseInfo = new abData.DatabaseInfo();

        results = await db.query_Select_Async('SHOW TABLES;');
        for (let row of results) {
            let tableName = row[Object.keys(row)[0]];
            if (tableName[0] === '_')
                continue;

            let tableInfo = new abData.TableInfo(tableName);

            results = await db.query_Select_Async(`DESC \`${tableInfo.name}\`;`);
            for (let row of results) {
                tableInfo.addFieldInfo(new abData.FieldInfo(
                    row.Field,
                    row.Type,
                    row.Key,
                    row.Null === 'NO',
                ));
            }

            databaseInfo.addTableInfo(tableInfo);
        }

        return databaseInfo;
    }

    async exec_Async(scheme, connectionInfo)
    {
        js0.args(arguments, abData.scheme.DataScheme, js0.Preset({
            host: 'string',
            database: 'string',
            user: 'string',
            password: 'string',
        }));

        let dbInfo_Conf = scheme.createDatabaseInfo();;

        let ignored_TableNames = scheme.getIgnored_TableNames();

        let db = abMySQL.connect({
            host: 'localhost',
            database: 'alta-associations',
            user: 'root',
            password: '',
        });

        let dbInfo_DB = await this.createDatabaseInfo_Async(db);

        let actions = abData.DatabaseInfo.Compare(dbInfo_Conf, dbInfo_DB);

        for (let tableName of actions.tables.delete) {
            if (tableName[0] === '_')
                continue;
            if (ignored_TableNames.includes(tableName))
                continue;

            let result = await db.query_Execute_Async(`DROP TABLE ${tableName}`);
        }

        for (let tableName of actions.tables.create) {
            if (tableName[0] === '_')
                continue;
            if (ignored_TableNames.includes(tableName))
                continue;
            
            let tableInfo = dbInfo_Conf.getTableInfo_ByName(tableName);

            let query_Create = tableInfo.getQuery_Create() + 
                    ' ENGINE=InnoDB DEFAULT CHARSET=utf8';

            let result = await db.query_Execute_Async(query_Create);
        }

        db.disconnect();
    }

}
module.exports = new abData_DBSync_Class();