import { graphql } from "@octokit/graphql";
import { BaseUpdate } from "./shared.types";

interface DailyUpdateObj extends BaseUpdate {}

const gqlQuery = `\
query getDiscussions($searchQuery:String!) {
    search(type: DISCUSSION, query: $searchQuery, last: 20) {
        edges {
          node {
            ... on Discussion {
              title
              url
              comments(last:20) {
                nodes {
                  body
                  url
                }
              }
            }
          }
        }
      }
    }
`

export const getDiscussions = async ({ owner, repo }, GH_TOKEN) => {
    const searchQuery = `repo:${owner}/${repo} label:add-to-daily-update`;
    // TODO: get discussions that haven't been closed:
    // newly created discussions
    // discussions with no comments
    
    const { search } = await graphql(gqlQuery, {
        searchQuery,
        headers: {
            authorization: `token ${GH_TOKEN}`
        },
    });

    const allSearchResultsMapped = search.edges.map(edge => {
        const { title, url, comments } = edge.node;
        const dailyUpdateComment : DailyUpdateObj['dailyUpdateComment'] = {
            message: ':robot: beep boop I don\'t see a comment for why this is important.',
            url: '',
        };
        comments.nodes.forEach(({ body, url }) => {
            if (body.includes('data-daily-update="true"')) {
                dailyUpdateComment.message = body.replace('<div visibility="hidden" data-daily-update="true"></div>', '').replace(/\n/g, '');
                dailyUpdateComment.url = url;
            }
        });
        return { dailyUpdateComment, title, url };
    });

    return allSearchResultsMapped;
}

export const formatDiscussions = (updateObj: DailyUpdateObj): string => {
    const urlMessage = updateObj.dailyUpdateComment?.url
        ? ` (from [comment](${updateObj.dailyUpdateComment?.url}))`
        : '';
    return `[${updateObj.title}](${updateObj.url}): ${updateObj.dailyUpdateComment?.message}${urlMessage}`;
}

async function getAndFormatDiscussions({ owner, repo }, GH_TOKEN): Promise<string> {
    const allDiscussions = await getDiscussions({ owner, repo }, GH_TOKEN);
    const updatesArray = allDiscussions.map(formatDiscussions);

    return updatesArray.length
        ? `- ${updatesArray.join('\n- ')}`
        : '';
}
export default getAndFormatDiscussions;
