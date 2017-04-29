const gulp = require('gulp');
const ts = require('gulp-typescript');
const tslint = require("gulp-tslint");
const sourcemaps = require("gulp-sourcemaps");
const del = require("del");
const merge = require('merge2');
const tsopt = "tsconfig.json";
gulp.task("tslint", () => {
    return gulp.src(["./src/**/*.ts"])
        .pipe(tslint({
            configuration: "tslint.json"
        }))
        .pipe(tslint.report({
            summarizeFailureOutput: true
        }))
});
gulp.task("clean", () => {
    del.sync(["release"]);
});
gulp.task("build", ["tslint"], () => {
    var tsProject = ts.createProject({
        declaration: true
    });
    var tsResult = gulp.src(["./src/**/*.ts"])
        .pipe(sourcemaps.init())
        .pipe(tsProject(tsopt));

    return merge([ // Merge the two output streams, so this task is finished when the IO of both operations is done. 
        tsResult.dts.pipe(gulp.dest('release/definitions')),
        tsResult.js.pipe(sourcemaps.write({sourceRoot: "../src"})).pipe(gulp.dest('release'))
    ]);
});
gulp.task("watch", () => {
    gulp.watch(["./src/**/*.ts"],["build"]);
});