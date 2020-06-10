import { CliDescriptor } from "./interfaces";

export const CLI_DESCRIPTOR_SYMBOL = Symbol.for('CLI_DESCRIPTOR');

function _cli(target: any) {
    if (target[CLI_DESCRIPTOR_SYMBOL] === undefined) {
        target[CLI_DESCRIPTOR_SYMBOL] = new CliDescriptor();
    }
}


/**
 * decorator used to mark class as cli command.
 *
 * @example usage
 * ```javascript
 * @Cli("spine:dosmth","Something to do")
 * export class SmthToDoCommand implements CliCommand{
 *  //.....
 * }
 * ```
 * Then invoke command from cli like this: spine spine:dosmth -option1 -option2 .....
 *
 * @param name - name of command, prefered name is eg. spine:dosmthg
 * @param description - command help, displayed when using --help option
 *
 *
 */
export function Cli(name: string, description: string) {
    return (target: any) => {

        _cli(target);


        target[CLI_DESCRIPTOR_SYMBOL].name = name;
        target[CLI_DESCRIPTOR_SYMBOL].description = description;
    };
}

/**
 * Decorator used to add command options ( arguments passed to `execute` command member function ).
 * Can be added multiple times to command.
 *
 * @param params - param name with options
 * @param description - description used in help
 * @see commander params definition examples
 *
 * @example params example
 * ```
 *  -s, --string // for normal value eg. string
 *  -i, --integer <n> // for integers
 *  -f, --float <n> // for floats
 *  -r, --range <a>..<b> // for range
 *  -l, --list <items> // for list
 *  -o, --optional [value] // for optional value
 * ```
 *
 * @example usage
 * ```javascript
 * @Cli("spine:dosmth","Something to do")
 * @Option("-o, --option1","Some option")
 * @Option("-o2, --option2 [value]","Some optional value")
 * export class SmthToDoCommand implements ICliCommand{
 *  //.....
 *
 *     execute(option1, option2){
 *          ....
 *     }
 * }
 * ```
 */
export function Option(params: string, description: string, required: boolean = false) {
    return (target: any) => {
        _cli(target);

        const descriptor = target[CLI_DESCRIPTOR_SYMBOL] as CliDescriptor;

        descriptor.options.push({
            Description: description,
            Params: params,
            Required: required
        });
    };
}
