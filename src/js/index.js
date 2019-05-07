import divide from "./lib.js";
import $ from "jquery";

import "core-js/features/promise";

console.log(divide(4, 2));
console.log(divide(5, 2));
console.log(divide(15, 2));
console.log(divide(105, 2));

$(document).ready(function () {

    console.log(1);
    $(".page-title").addClass("color-black");

});

(new Promise(function (resolve, reject) {
    setTimeout(resolve, 500);
})).then(() => {
    console.log("promise resolved");
});