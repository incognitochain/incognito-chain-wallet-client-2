// import * as passwordService from "./PasswordService";
// import sinon from "sinon";

// describe("get/set password", () => {
//   let clock;
//   beforeEach(() => {
//     clock = sinon.useFakeTimers();
//   });

//   afterEach(() => {
//     clock.restore();
//   });

//   test("still valid password", () => {
//     passwordService.savePassword("jira.github");

//     clock.tick(2);

//     expect(passwordService.getPassphrase()).toBe("jira.github");
//   });

//   test("expired password", () => {
//     passwordService.savePassword("jira.github");

//     clock.tick(7 * 24 * 3600 * 1000 + 1);

//     expect(passwordService.getPassphrase()).toBeFalsy();
//   });
// });
