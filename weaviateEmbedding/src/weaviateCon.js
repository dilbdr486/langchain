import weaviate from "weaviate-client";

export const connectionWeaviate = async () => {
  const wcdUrl = process.env.WEAVIATE_URL;
  const wcdApiKey = process.env.WEAVIATE_API_KEY;
  const cohereApiKey = process.env.COHERE_APIKEY || '';

  const client = await weaviate.connectToWeaviateCloud(wcdUrl, {
    authCredentials: new weaviate.ApiKey(wcdApiKey),
    headers: {
      'X-Cohere-Api-Key': cohereApiKey,
    }
  });

  // await client.collections.create({
  //   name: 'dilCollection',
  //   properties: [
  //     {
  //       name: 'title',
  //       dataType: 'text',
  //     },
  //   ],
  //   vectorizers: [
  //     weaviate.configure.vectorizer.text2VecCohere({
  //       name: 'title_vector',
  //       sourceProperties: ['title'],
  //       model: 'embed-multilingual-light-v3.0'
  //     }),
  //   ],
  //   // Additional parameters not shown
  // });

  return client;
};

export default connectionWeaviate;
