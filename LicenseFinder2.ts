//import { error } from 'console';
import { rejects } from 'assert';
import { dir } from 'console';
import * as fs from 'fs';
import * as path from 'path';
import { json } from 'stream/consumers';


function createFilePaths(startingPath: string) {
    console.log("making filepaths")
    return new Promise<string[]>((resolve, reject) => {
        const dir: string = path.join(startingPath, "node_modules");
        fs.readdir(dir, (err: NodeJS.ErrnoException | null, files: string[]) => {
            if (err) {
                console.log(err);
                reject(err);
            };
            const filePaths: string[] = files.map((file) => path.join(dir, file));
            resolve(filePaths);
        }
        )
    });
};

function findProjects(filePaths: string[]) {
    console.log("finding projects");

    return new Promise<string[]>((resolve, reject) => {
        const projects: string[] = [];
        const promises: Promise<void>[] = [];

        filePaths.forEach((file) => {
            const promise = new Promise<void>((innerResolve, innerReject) => {
                fs.stat(file, (error: NodeJS.ErrnoException | null, stats: fs.Stats) => {
                    if (error) {
                        innerReject(error);
                    }
                    else if (stats.isDirectory()) {
                        projects.push(file);
                    }
                    innerResolve();

                }
                );
            });
            //console.log(promise)
            promises.push(promise);
        });

        // Use Promise.all to wait for all promises to resolve
        Promise.all(promises)
            .then(() => {
                resolve(projects);
            })
            .catch((error) => {
                reject(error);
            });
    });
}

function filterAuthors(projects: string[]) {
    console.log("finding authors");
    return new Promise<string[]>((resolve, reject) => {
        const promises: Promise<void>[] = [];
        const authors: string[] = [];
        //const dependencies:string[]=[];

        projects.forEach((project) => {
            const promise2 = new Promise<void>((innerResolve, innerReject) => {
                fs.readdir(project, (err: NodeJS.ErrnoException | null, dir: string[]) => {
                    if (err) {
                        innerReject(err);
                    }
                    //console.log(project)
                    //console.log(dir)
                    dir.every((file) => {
                        const promise3 = new Promise<void>((innerResolve2, innerReject2) => {
                            //check if every file in the list is a dir and if true add the list to authours 
                            //console.log(file)
                            fs.stat(path.join(project, file), (error: NodeJS.ErrnoException | null, stats: fs.Stats) => {
                                if (error) {
                                    innerReject2(error);
                                }
                                else if (stats.isDirectory()) {
                                    authors.push(project)
                                }
                            })
                            innerResolve2()

                        })
                        promises.push(promise3)

                    })
                    innerResolve();
                })
            })
            promises.push(promise2)
        });


        Promise.all(promises)
            .then(() => {
                //console.log(authors)
                //console.log(dependencies)
                resolve(authors);

            })
            .catch((error) => {
                reject(error);
            });
    });
}
function createAuthorFP(authors: string[]) {
    console.log("making author filePaths")
    return new Promise<string[]>((resolve, reject) => {
        const promises: Promise<void>[] = [];
        const dependencies: string[] = []

        authors.forEach((authDir) => {
            const promise = new Promise<void>((innerResolve, innerReject) => {
                fs.readdir(authDir, (err: NodeJS.ErrnoException | null, authDirs: string[]) => {
                    if (err) {
                        console.log(err);
                        innerReject(err);
                    };
                    //console.log(dir)
                    authDirs.forEach((dir) => {
                        //console.log(dir)
                        const promise2 = new Promise<void>((innerResolve2, innerReject2) => {
                            fs.readdir(path.join(authDir, dir), (err: NodeJS.ErrnoException | null, files: string[]) => {
                                if (err) {
                                    innerReject2(err)
                                }
                                files.forEach((file) => {
                                    //console.log(path.join(authDir, file))
                                    dependencies.push(path.join(authDir, file))
                                })
                                //console.log(files)
                                innerResolve2()
                            })
                        })
                        promises.push(promise2)
                    })
                    innerResolve()
                    //console.log(files)
                    //promises.push(promise)
                })
            })
            promises.push(promise)
        })
        Promise.all(promises)
            .then(() => {
                //console.log(promises)
                //console.log(dependencies)
                resolve(dependencies);

            })
            .catch((error) => {
                reject(error);
            });
    })
}

function removeDuplicatesFromList1(list1: string[], list2: string[]): string[] {
    const set2 = new Set(list2);
    const uniqueList1 = list1.filter(item => !set2.has(item));

    return uniqueList1;
}
/*function findJson(authors:string[],projects:string[]){
    console.log("promise start 4")
    return new Promise<string[]>((resolve,reject)=>{
        const promises:Promise<void>[]=[];
        const jsonFiles:string[];
    })
}*/


createFilePaths('/Users/yousen01/Arm/ksc-ide')
    .then(filePaths => {
        //console.log(filePaths))
        return findProjects(filePaths)
    })
    .then(projects => {
        return filterAuthors(projects)
    })
    .then(authors => {
        //console.log(authors)
        return createAuthorFP(authors)
    })
    .then(dependencies => {
        console.log(dependencies)
    })
    .catch(error => {
        console.error("Error:", error);
    })