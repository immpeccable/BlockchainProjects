const { expect, assert } = require("chai");
const { ethers } = require("hardhat");

describe("SimpleStorage", function () {
    let simpleStorageFactory, simpleStorage;
    beforeEach(async function () {
        simpleStorageFactory = await ethers.getContractFactory("SimpleStorage");

        simpleStorage = await simpleStorageFactory.deploy();
    });

    it("should start with a favorite number of 0", async function () {
        const currentValue = await simpleStorage.retrieve();
        assert.equal(currentValue.toString(), "0");
    });

    it("should update when we call store", async function () {
        const tr = await simpleStorage.store("10");
        await tr.wait(1);
        const updatedValue = await simpleStorage.retrieve();
        assert.equal(updatedValue, "10");
    });
});
