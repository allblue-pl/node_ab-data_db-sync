                                        
import fs from "node:fs";
import path from "node:path";

export function findPackage(packagePaths               , eTable        )              {
    for (let packagePath of packagePaths) {
        let dirs = fs.readdirSync(packagePath);
        for (let dir of dirs) {
            if (dir === eTable.packageName)
                return path.join(packagePath, dir);
        }
    }

    return null;
};

export function getETable(tableDef          )         {
    let tableName_Arr = tableDef.name.split('_');
    let prefix = '';
    while (tableName_Arr[0] === '') {
        tableName_Arr.splice(0, 1);
        prefix += '_';
    }

    tableName_Arr[0] = prefix + tableName_Arr[0];

    return {
        packageName: tableName_Arr[0],
        fullName: tableDef.name,
        name: tableName_Arr.slice(1).join('_'),
        table: tableDef,
    };
};


                      
                        
                     
                 
                    
 