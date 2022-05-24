# daily-update-action
A GitHub Action workflow that takes any Daily Update discussion and posts about it in your Slack channel.

## How to Use
1. Ensure you have a workflow file defined in your repo where you want to use this action. The following example can be inserted into your workflow and customized to your needs:

```
- name: Run my action
    uses: inkblotty/daily-update-action@main
    with:
      discussion_id: 989
      owner: inkblotty
      repo: daily-update
      slack_channel_id: ABC123456XYZ
    env:
      GH_TOKEN: ${{ secrets.GH_TOKEN }}
      SLACK_TOKEN: ${{ secrets.SLACK_TOKEN }}
```

2. Add the `add-to-daily-udpate` label to any issues or discussions that you want in the update.
    - Note that Deep Dives and Office Hours reminders are handled for you
 
3. Add metadata to the comment you want to appear in the Daily Update.
    ```html
    <div visibility="hidden" data-daily-update="true"></div>
    ```

## Required inputs
### Environment variables
#### GH_TOKEN
The Personal Access Token with access to the repository being queried for updates.

#### SLACK_TOKEN
The Slack Token with access to the channel where Daily Update comments are made.

### Input variables
#### owner
The organization or user owning the repo.

#### repo
The repo to query for updates.

#### discussion_id
The ID of the discussion where full Daily Update comments are posted.

#### slack_channel_id
The Slack channel where Daily Update comments are posted.
