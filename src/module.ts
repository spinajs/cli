import { Autoinject, IContainer, Injectable, AsyncModule } from "@spinajs/di";
import { ClassInfo, ListFromFiles } from "@spinajs/reflection";
import { Configuration } from "@spinajs/configuration";
import { InvalidArgument } from "@spinajs/exceptions";
import { Logger, Log } from "@spinajs/log";

import { ICliCommand, CliDescriptor } from "./interfaces";
import { CLI_DESCRIPTOR_SYMBOL } from "./decorators";

import { Command } from 'commander'; 

export abstract class CliBase<T> implements ICliCommand {
    public get Name(): string {
        const desc = (this.constructor as any)[CLI_DESCRIPTOR_SYMBOL] as CliDescriptor;
        return desc.name;
    }

    public abstract execute(args: T): Promise<number>;
}


export abstract class CliModule extends AsyncModule {
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

    @ListFromFiles("/**/!(*.d).{ts,js}", "system.dirs.commands")
    public Commands: Array<ClassInfo<ICliCommand>>;

    /**
     * Global configuration. It takes `system.dirs.cli` variable with array of dirs to check
     */
    @Autoinject()
    protected Config: Configuration;

    @Logger()
    protected Log: Log;

    /**
     * process arguments list
     */
    protected Args: string[];

    /**
     * Di container that creates this module
     */
    protected Container: IContainer;

    protected Commander: any;

    /**
     * Constructs CLI module
     *
     * @param args? command line args array (eg process.argv) if not set, default process.argv is used
     */
    constructor(args?: string[]) {
        super();

        this.Args = args ?? process.argv;
        this.Commander = new Command();
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

        const command = this.Commands.find(c => {
            const desc = c.type[CLI_DESCRIPTOR_SYMBOL] as CliDescriptor;
            return desc.name === name;
        });

        if (!command) {
            return null;
        }

        return await this.Container.resolve(command.type);
    }

    public async resolveAsync(container: IContainer): Promise<void> {
        const self = this;
        this.Container = container;

        for(const entry of this.Config.get<[]>("cli.di.registry")){
            this.Container.register((entry as any).type).as((entry as any).as);
        }

        this.Commander.version(`Spinajs version: ${this.Config.get('system.version', 'UNKNOWN')}`);

        this.Commands.forEach(c => {

            const desc = c.type[CLI_DESCRIPTOR_SYMBOL] as CliDescriptor;
            const cmd = this.Commander.command(desc.name).description(desc.description);

            desc.options.forEach(o => {
                cmd.option(o.Params, o.Description);
            });

            // tslint:disable-next-line: only-arrow-functions
            cmd.action(function() {
                const args = arguments;
                self.get(desc.name).then((c : ICliCommand) => {
                    c.execute(...args).then(r => {
                        self.Log.info(`Command ${desc.name} finished !`);

                        if (self.Config.get("cli.exitOnEnd")) {
                            process.exit(r);
                        }
                    }).catch(ex => {
                        self.Log.error(ex, `Cannot execute command ${desc.name}`);
                    });
                });
            });
        });

        if (!this.Args || this.Args.length < 3) {
            this.Commander.help();
            return;
        }

        await this.Commander.parseAsync(this.Args);
    }
}
