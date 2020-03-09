
/**
 * Cli option description. Its passed as command arguments
 */
export interface ICliOption {
    /**
     * Param definition.
     * @see commander params definition examples
     *
     * @example
     * ```
     *  -s, --string // for normal value eg. string
     *  -i, --integer <n> // for integers
     *  -f, --float <n> // for floats
     *  -r, --range <a>..<b> // for range
     *  -l, --list <items> // for list
     *  -o, --optional [value] // for optional value
     * ```
     */
    Params: string;

    /**
     * Description for option, used in option help.
     */
    Description: string;
}


/**
 * Cli argument description
 */
export interface ICliArgument {
    /**
     * Cli option eg.  -s, --string
     */
    Option: string;

    /**
     * Argument description used in help
     */
    Description: string;
}

/**
 * Cli command interface declaration.
 */
export interface ICliCommand {
    /**
     * Command name
     */
    name: string;

    /**
     * This function is executed by cli. Do command stuff here.
     */
    execute: (...args: any[]) => void;
}

/**
 * Internall cli command descriptor. Describes command options, name & help
 */
export class CliDescriptor {
    /**
     * Name of command eg. test:cli
     */
    public name: string = '';

    /**
     * Command general description, used when displaying help
     */
    public description: string = '';

    /**
     * Cli commands options
     * @see CliOption
     */
    public options: ICliOption[] = [];
}

