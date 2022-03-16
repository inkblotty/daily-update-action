const github = require("@actions/github");

export const getDeepDiveIssues = async (repo) => {
    const label = "Deep-dive";

    // get deep dives in groups:
    // newly created deep dives
    // deep dives without a leader or notetaker
    // deep dives with a past date that need notes or a Rewatch
}

export const getMeetingIssues = async (repo) => {
    const label = "meeting";

    // get meetings in groups:
    // newly created meetings
    // meetings with a timeline beginning tomorrow
}

export const getDailyUpdateIssues = async (repo) => {
    const label = "add-to-daily-update";

    // whatever issues I might have flagged for assistance
}

export const getDiscussions = async (repo) => {
    // get discussions that haven't been closed:
    // newly created discussions
    // discussions with no comments
    // discussions with label "add-to-daily-update"
}
