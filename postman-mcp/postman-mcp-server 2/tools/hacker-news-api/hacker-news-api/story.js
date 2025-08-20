/**
 * Function to retrieve a story from Hacker News by its item ID.
 *
 * @param {Object} args - Arguments for the story retrieval.
 * @param {string} args.itemId - The unique ID of the item to retrieve.
 * @returns {Promise<Object>} - The result of the story retrieval.
 */
const executeFunction = async ({ itemId }) => {
  const baseUrl = 'https://hacker-news.firebaseio.com/v0';
  try {
    // Construct the URL for the specific item
    const url = `${baseUrl}/item/${itemId}.json?print=pretty`;

    // Perform the fetch request
    const response = await fetch(url, {
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
    console.error('Error retrieving story:', error);
    return { error: 'An error occurred while retrieving the story.' };
  }
};

/**
 * Tool configuration for retrieving a story from Hacker News.
 * @type {Object}
 */
const apiTool = {
  function: executeFunction,
  definition: {
    type: 'function',
    function: {
      name: 'get_story',
      description: 'Retrieve a story from Hacker News by its item ID.',
      parameters: {
        type: 'object',
        properties: {
          itemId: {
            type: 'string',
            description: 'The unique ID of the item to retrieve.'
          }
        },
        required: ['itemId']
      }
    }
  }
};

export { apiTool };