import weaviate from 'weaviate-client';
import { vectorizer,generative } from 'weaviate-client';
import dotenv from "dotenv";
dotenv.config();

// Best practice: store your credentials in environment variables
const WEAVIATE_URL = process.env.WEAVIATE_URL;
const WEAVIATE_API_KEY = process.env.WEAVIATE_API_KEY;
const cohereKey = process.env.COHERE_APIKEY;

export async function main() {

  const client = await weaviate.connectToWeaviateCloud(
    WEAVIATE_URL, // Replace with your Weaviate Cloud URL
    {
      authCredentials: new weaviate.ApiKey(WEAVIATE_API_KEY),
      headers: {
        'X-Cohere-Api-Key': cohereKey, // Replace with your Cohere API key
      }, // Replace with your Weaviate Cloud API key
    }
  );

  // Load data
// async function getJsonData() {
//     const file = await fetch(
//       'https://raw.githubusercontent.com/weaviate-tutorials/quickstart/main/data/jeopardy_tiny.json'
//     );
//     return file.json();
//   }
  
  // Note: The TS client does not have a `batch` method yet
  // We use `insertMany` instead, which sends all of the data in one request
  // async function importQuestions() {
  //   const questions = client.collections.get('Question');
  //   const data = await getJsonData();
  //   const result = await questions.data.insertMany(data);
  //   console.log('Insertion response: ', result);
  // }
  
  // await importQuestions();


  const questions = client.collections.get('Question');

// result.objects.forEach((item) => {
//   console.log(JSON.stringify(item.properties, null, 2));
// });


const result = await questions.generate.nearText(
  'biology',
  {
    groupedTask: 'list out the animal of the given.',
  },
  {
    limit: 2,
  }
);

console.log(result.generated);


  client.close(); // Close the client connection
}
