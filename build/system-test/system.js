"use strict";
/**
 * Copyright 2018 Google LLC. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const cp = require("child_process");
const fs = require("fs");
const path = require("path");
const rimraf = require("rimraf");
const util = require("util");
const mkdir = util.promisify(fs.mkdir);
const rmrf = util.promisify(rimraf);
const baseRepoUrl = 'https://github.com/googleapis/';
const testDir = path.join(process.cwd(), '.system-test-run');
function execute(command, cwd) {
    return __awaiter(this, void 0, void 0, function* () {
        cwd = cwd || process.cwd();
        const maxBuffer = 10 * 1024 * 1024;
        console.log(`Execute: ${command} [cwd: ${cwd}]`);
        return new Promise((resolve, reject) => {
            cp.exec(command, { cwd, maxBuffer }, (err, stdout, stderr) => {
                if (err) {
                    reject(new Error(`Command ${command} terminated with error ${err}`));
                }
                else {
                    resolve({ stdout, stderr });
                }
            });
        });
    });
}
function spawn(command, args, cwd) {
    return __awaiter(this, void 0, void 0, function* () {
        cwd = cwd || process.cwd();
        args = args || [];
        console.log(`Execute: ${command} ${args.join(' ')} [cwd: ${cwd}]`);
        return new Promise((resolve, reject) => {
            const child = cp.spawn(command, args || [], {
                cwd,
                stdio: 'inherit'
            }).on('close', (code, signal) => {
                if (code === 0) {
                    resolve();
                }
                else {
                    reject(new Error(`Command ${command} terminated with code ${code}, signal ${signal}`));
                }
            });
        });
    });
}
function latestRelease(cwd) {
    return __awaiter(this, void 0, void 0, function* () {
        const gitTagOutput = (yield execute('git tag --list', cwd)).stdout;
        const tags = gitTagOutput.split('\n')
            .filter(str => str.match(/^v\d+\.\d+\.\d+$/))
            .sort((tag1, tag2) => {
            const match1 = tag1.match(/^v(\d+)\.(\d+)\.(\d+)$/);
            const match2 = tag2.match(/^v(\d+)\.(\d+)\.(\d+)$/);
            if (!match1 || !match2) {
                throw new Error(`Cannot compare git tags ${tag1} and ${tag2}`);
            }
            // compare major version, then minor versions, then patch versions.
            // return positive number, zero, or negative number
            for (let idx = 1; idx <= 3; ++idx) {
                if (match1[idx] !== match2[idx]) {
                    return Number(match1[idx]) - Number(match2[idx]);
                }
            }
            return 0;
        });
        // the last tag in the list is the latest release
        return tags[tags.length - 1];
    });
}
function preparePackage(packageName) {
    return __awaiter(this, void 0, void 0, function* () {
        yield spawn('git', ['clone', `${baseRepoUrl}${packageName}.git`, packageName]);
        const tag = yield latestRelease(packageName);
        yield spawn('git', ['checkout', tag], packageName);
        yield spawn('npm', ['install'], packageName);
        yield spawn('npm', ['link', '../../'], packageName);
    });
}
function runSystemTest(packageName) {
    return __awaiter(this, void 0, void 0, function* () {
        yield spawn('npm', ['run', 'system-test'], packageName);
    });
}
describe('Run system tests for some libraries', () => {
    before(() => __awaiter(this, void 0, void 0, function* () {
        yield rmrf(testDir);
        yield mkdir(testDir);
        process.chdir(testDir);
        console.log(`Running tests in ${testDir}.`);
    }));
    // Video intelligence API has long running operations
    describe('video-intelligence', () => {
        before(() => __awaiter(this, void 0, void 0, function* () {
            yield preparePackage('nodejs-video-intelligence');
        }));
        it('should pass system tests', () => __awaiter(this, void 0, void 0, function* () {
            yield runSystemTest('nodejs-video-intelligence');
        }));
    });
    // Pub/Sub has streaming methods and pagination
    describe('pubsub', () => {
        before(() => __awaiter(this, void 0, void 0, function* () {
            yield preparePackage('nodejs-pubsub');
        }));
        it('should pass system tests', function () {
            return __awaiter(this, void 0, void 0, function* () {
                // Pub/Sub tests can be slow since they check packaging
                this.timeout(300000);
                yield runSystemTest('nodejs-pubsub');
            });
        });
    });
    // Speech only has smoke tests, but still...
    describe('speech', () => {
        before(() => __awaiter(this, void 0, void 0, function* () {
            yield preparePackage('nodejs-speech');
        }));
        it('should pass system tests', () => __awaiter(this, void 0, void 0, function* () {
            yield runSystemTest('nodejs-speech');
        }));
    });
});
//# sourceMappingURL=system.js.map