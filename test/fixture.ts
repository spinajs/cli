import { join, normalize, resolve } from 'path';
import { Configuration } from '@spinajs/configuration';
import _ from 'lodash';

export function dir(path: string) {
    return resolve(normalize(join(__dirname, path)));
}

export class CliConf extends Configuration {

    protected conf = {
        system: {
            dirs: {
                commands: [dir("./commands")],
            }
        },
        cli: {
            exitOnEnd: false
        }
    }

    public get(path: string[], defaultValue?: any): any {
        return _.get(this.conf, path, defaultValue);
    }

    // tslint:disable-next-line: no-empty
    public resolve(){
        
    }
}