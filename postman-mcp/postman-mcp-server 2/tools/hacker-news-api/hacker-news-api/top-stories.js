/**
 * Function to fetch the top stories from Hacker News.
 *
 * @returns {Promise<Array<number>>} - A promise that resolves to an array of top story IDs.
 */
const executeFunction = async () => {
  const url = 'https://hacker-news.firebaseio.com';
  try {
    // Construct the URL for the top stories
    const endpoint = `${url}/v0/topstories.json?print=pretty`;

    // Perform the fetch request
    const response = await fetch(endpoint, {
      method: 'GET'
    });

    // Check if the response was successful
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData);
    }

    // Parse and return the response data
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching top stories:', error);
    return { error: 'An error occurred while fetching top stories.' };
  }
};

/**
 * Tool configuration for fetching top stories from Hacker News.
 * @type {Object}
 */
const apiTool = {
  function: executeFunction,
  definition: {
    type: 'function',
    function: {
      name: 'fetch_top_stories',
      description: 'Fetch the top stories from Hacker News.',
      parameters: {
        type: 'object',
        properties: {},
        required: []
      }
    }
  }
};

export { apiTool };