import {set as deepSet} from "lodash";
import {assert, describe, expect, it} from "vitest";

import {CalculatedValue} from "../src/CalculatedValue";
import {ChangeManager} from "../src/ChangeManager";
import {AdHocData, NodeStyle} from "../src/config";

describe("ChangeManager", () => {
    it("exists", () => {
        assert.isFunction(ChangeManager);
    });

    it("sets a value without crashing", () => {
        let obj = {beer: "yum"} as unknown as AdHocData;
        const path = "foo.bar.thing";

        const cm = new ChangeManager();
        obj = cm.watch("data", obj);

        deepSet(obj, path, "someval");
    });

    it("runs calculated value", () => {
        // setup test
        const inputPath = "graphty.degree.total";
        const outputPath = "style.shape.size";
        const cm = new ChangeManager();
        const algObj = cm.watch("algorithmResults", {} as unknown as AdHocData);
        const styleObj = cm.addData("style", {} as unknown as AdHocData);
        cm.addCalculatedValue(new CalculatedValue([`algorithmResults.${inputPath}`], outputPath, `{
            return arguments[0] * 2;
        }`));

        // run test
        deepSet(algObj, inputPath, 5);

        // validate test results
        const expectedStyle = {shape: {size: 10}} as unknown as AdHocData;
        assert.deepStrictEqual(styleObj, expectedStyle);
    });

    it("validates schema", () => {
        // setup test
        const inputPath = "graphty.degree.total";
        const outputPath = "style.shape.size";
        const cm = new ChangeManager();
        const algObj = cm.watch("algorithmResults", {} as unknown as AdHocData);
        const styleObj = cm.addData("style", {} as unknown as AdHocData, NodeStyle);
        cm.addCalculatedValue(new CalculatedValue([`algorithmResults.${inputPath}`], outputPath, `{
            return arguments[0] * 2;
        }`));

        // run test
        deepSet(algObj, inputPath, 5);

        // validate test results
        const expectedStyle = {shape: {size: 10}} as unknown as AdHocData;
        assert.deepStrictEqual(styleObj, expectedStyle);
    });

    it("throws on bad schema", () => {
        // setup test
        const inputPath = "graphty.degree.total";
        const outputPath = "style.shape.type";
        const cm = new ChangeManager();
        const algObj = cm.watch("algorithmResults", {} as unknown as AdHocData);
        cm.addData("style", {} as unknown as AdHocData, NodeStyle);
        cm.addCalculatedValue(new CalculatedValue([`algorithmResults.${inputPath}`], outputPath, `{
            return arguments[0] * 2;
        }`));

        // run test
        expect(() => {
            deepSet(algObj, inputPath, 5);
        }).toThrow(/Invalid option: expected one of /);
    });

    it("converts color", () => {
        // setup test
        const inputPath = "graphty.degree.total";
        const outputPath = "style.texture.color";
        const cm = new ChangeManager();
        const algObj = cm.watch("algorithmResults", {} as unknown as AdHocData);
        const styleObj = cm.addData("style", {} as unknown as AdHocData, NodeStyle);
        cm.addCalculatedValue(new CalculatedValue([`algorithmResults.${inputPath}`], outputPath, `{
            return "lightblue";
        }`));

        // run test
        deepSet(algObj, inputPath, 5);

        // validate test results
        const expectedStyle = {texture: {color: "#ADD8E6"}} as unknown as AdHocData;
        assert.deepStrictEqual(styleObj, expectedStyle);
    });

    // TODO: converts color
});
