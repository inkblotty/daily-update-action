"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getDiscussions = exports.getDailyUpdateIssues = exports.getMeetingIssues = exports.getDeepDiveIssues = void 0;
const github = require("@actions/github");
const getDeepDiveIssues = (repo) => __awaiter(void 0, void 0, void 0, function* () {
    const label = "Deep-dive";
    // get deep dives in groups:
    // newly created deep dives
    // deep dives without a leader or notetaker
    // deep dives with a past date that need notes or a Rewatch
});
exports.getDeepDiveIssues = getDeepDiveIssues;
const getMeetingIssues = (repo) => __awaiter(void 0, void 0, void 0, function* () {
    const label = "meeting";
    // get meetings in groups:
    // newly created meetings
    // meetings with a timeline beginning tomorrow
});
exports.getMeetingIssues = getMeetingIssues;
const getDailyUpdateIssues = (repo) => __awaiter(void 0, void 0, void 0, function* () {
    const label = "add-to-daily-update";
    // whatever issues I might have flagged for assistance
});
exports.getDailyUpdateIssues = getDailyUpdateIssues;
const getDiscussions = (repo) => __awaiter(void 0, void 0, void 0, function* () {
    // get discussions that haven't been closed:
    // newly created discussions
    // discussions with no comments
    // discussions with label "add-to-daily-update"
});
exports.getDiscussions = getDiscussions;
//# sourceMappingURL=issues.js.map