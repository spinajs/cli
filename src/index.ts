import { ResolveStrategy, Autoinject, IContainer, DI, Injectable } from "@spinajs/di";
import { ClassInfo, ListFromFiles } from "@spinajs/reflection";
import { Configuration } from "@spinajs/configuration";
import { InvalidArgument } from "@spinajs/exceptions";

import { ICliCommand, CliDescriptor } from "./interfaces";
import { CLI_DESCRIPTOR_SYMBOL } from "./decorators";

import * as commander from 'commander';


export abstract class CliBase<T> implements ICliCommand {
    public get name(): string {
        const desc = (this.constructor as any)[CLI_DESCRIPTOR_SYMBOL] as CliDescriptor;
        return desc.name;
    }

    public abstract execute(args: T): void;
}


export abstract class CliModule extends ResolveStrategy {
    /**
     * Avaible commands ready to run
     */
    public abstract Commands: Array<ClassInfo<ICliCommand>>;

    /**
     * Gets command by name
     *
     * @param name name of command
     */
    public abstract get(name: string): Promise<ICliCommand>;
}

@Injectable()
export class FrameworkCliModule extends CliModule {

    /**
     * Avaible commands ready to run
     */

    @ListFromFiles("/**/*.{ts,js}", "system.dirs.models")
    public Commands: Array<ClassInfo<ICliCommand>>;

    /**
     * Global configuration. It takes `system.dirs.cli` variable with array of dirs to check
     */
    @Autoinject()
    protected Cfg: Configuration;

    /**task
     * process arguments list
     */
    protected Args: string[];

    /**
     * Di container that creates this module
     */
    protected Container: IContainer;

    /**
     * Constructs CLI module
     *
     * @param args? command line args array (eg process.argv) if not set, default process.argv is used
     */
    constructor(args?: string[]) {
        super();

        this.Args = args ?? process.argv;
    }

    /**
     * Gets new command instance by name
     *
     * @param name name of command
     */
    public async get(name: string): Promise<ICliCommand> {
        if (!name) {
            throw new InvalidArgument(`parameter name is null or empty`);
        }

        const command = this.Commands.find(c => c.name === name);

        if (!command) {
            return null;
        }

        return await this.Container.resolve(command.type);
    }

    public resolve(container: IContainer): void {
        this.Container = container;

        commander.version(`Spinajs version: ${this.Cfg.get('system.version', 'UNKNOWN')}`);

        this.Commands.forEach(c => {

            const desc = c.type[CLI_DESCRIPTOR_SYMBOL] as CliDescriptor;
            const cmd = commander.command(desc.name).description(desc.description);

            desc.options.forEach(o => {
                cmd.option(o.Params, o.Description);
            });

            cmd.action((...args: string[]) => {
                this.get(desc.name).then(c => {
                    c.execute(...args);
                });
            });
        });

        if (!this.Args || this.Args.length < 3) {
            commander.help();
            return;
        }

        commander.parse(this.Args);
    }
}
