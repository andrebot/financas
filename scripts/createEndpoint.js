const fs = require('fs');
const path = require('path');

const endpointName = process.argv[2];

if (!endpointName) {
  console.error('Please provide a folder\'s name.');
  process.exit(1);
}

function capitalize(string) {
  return string.charAt(0).toUpperCase() + string.slice(1);
}

const endpointContent = `import baseApi from '../apiSlice';
import type { ApiBuilder } from '../../types/requests';

export const list${capitalize(endpointName)}Query = () => ({
  url: '/account',
  method: 'GET',
});

export const create${capitalize(endpointName)}Mutation = (body: TYPE) => ({
  url: '/account',
  method: 'POST',
  body,
});

export const update${capitalize(endpointName)}Mutation = (body: TYPE) => ({
  url: \`/account/\${body.id}\`,
  method: 'PUT',
  body,
});

export const delete${capitalize(endpointName)}Mutation = (id: string) => ({
  url: \`/account/\${id}\`,
  method: 'DELETE',
});

export const get${capitalize(endpointName)}Query = (id: string) => ({
  url: \`/account/\${id}\`,
  method: 'GET',
});

// This was done so testing would be easier.
export const endpoints = (builder: ApiBuilder) => ({
  listCONTENT: builder.query<TYPE[], void>({
    query: list${capitalize(endpointName)}Query,
  }),
  createCONTENT: builder.mutation<TYPE, TYPE>({
    query: create${capitalize(endpointName)}Mutation,
  }),
  updateCONTENT: builder.mutation<TYPE, TYPE>({
    query: update${capitalize(endpointName)}Mutation,
  }),
  deleteCONTENT: builder.mutation<TYPE, string>({
    query: delete${capitalize(endpointName)}Mutation ,
  }),
  getCONTENT: builder.query<TYPE, string>({
    query: get${capitalize(endpointName)}Query ,
  }),
});

export const ${endpointName}API = baseApi.injectEndpoints({
  endpoints,
});

export const {
  useListCONTENTQuery,
  useCreateCONTENTMutation,
  useUpdateCONTENTMutation,
  useDeleteCONTENTMutation,
  useGETCONTENTQuery,
} = ${endpointName}API;
`;


const folderPath = path.join(__dirname, `../src/client/features/${endpointName}`);

if (!fs.existsSync(folderPath)) {
  fs.mkdirSync(folderPath, { recursive: true });
}

const endpointFilePath = path.join(folderPath, `index.tsx`);

fs.writeFileSync(endpointFilePath, endpointContent);
