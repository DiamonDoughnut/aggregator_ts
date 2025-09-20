import fs from "fs";
import os from "os";
import path from "path";


export interface Config {
    dbUrl: string
    currentUserName: string
}


export function getConfigFilePath() {
    const homePath = os.homedir();
    const configFileName = "/.gatorconfig.json"
    return path.join(homePath + configFileName);
}

export function readConfig() {
    try {   
        const filePath = getConfigFilePath();
        const file = fs.readFileSync(filePath, {encoding: "utf-8"})
        const fileParse = JSON.parse(file)
        const configFile = validateConfig(fileParse)
        return configFile
    } catch (error) {
        console.log(error)
    }
}

export function writeConfig(cfg: Config) {
    try {
        const filePath = getConfigFilePath();
        const jsonCfg = {
            db_url: cfg.dbUrl,
            current_user_name: cfg.currentUserName
        };
        const dataString = JSON.stringify(jsonCfg, null, 2)
        fs.writeFileSync(filePath, dataString)
    } catch (error) {
        console.log(error)
    }

}

export function validateConfig(rawCfg: any) {
    const config: Config = {
        dbUrl: rawCfg.db_url ?? rawCfg.dbUrl,
        currentUserName: rawCfg.current_user_name ?? rawCfg.currentUserName ?? ""
    };
    if (config.dbUrl) {
        return config;
    }
    throw new Error("Data is not a correctly formatted Config object")
}