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
import type { ApiBuilder } from '../../types';

export const list${capitalize(endpointName)}Query = () => ({
  url: '/ENDPOINT',
  method: 'GET',
});

export const create${capitalize(endpointName)}Mutation = (body: TYPE) => ({
  url: '/ENDPOINT',
  method: 'POST',
  body,
});

export const update${capitalize(endpointName)}Mutation = (body: TYPE) => ({
  url: \`/ENDPOINT/\${body.id}\`,
  method: 'PUT',
  body,
});

export const delete${capitalize(endpointName)}Mutation = (id: string) => ({
  url: \`/ENDPOINT/\${id}\`,
  method: 'DELETE',
});

export const get${capitalize(endpointName)}Query = (id: string) => ({
  url: \`/ENDPOINT/\${id}\`,
  method: 'GET',
});

// This was done so testing would be easier.
export const endpoints = (builder: ApiBuilder) => ({
  listCONTENT: builder.query<TYPE[], void>({
    query: list${capitalize(endpointName)}Query,
    providesTags: [{ type: 'TAG_NAME', id: 'LIST' }],
  }),
  createCONTENT: builder.mutation<TYPE, TYPE>({
    query: create${capitalize(endpointName)}Mutation,
    invalidatesTags: [{ type: 'TAG_NAME', id: 'LIST' }],
  }),
  updateCONTENT: builder.mutation<TYPE, TYPE>({
    query: update${capitalize(endpointName)}Mutation,
    invalidatesTags: [{ type: 'TAG_NAME', id: 'LIST' }],
  }),
  deleteCONTENT: builder.mutation<TYPE, string>({
    query: delete${capitalize(endpointName)}Mutation ,
    invalidatesTags: [{ type: 'TAG_NAME', id: 'LIST' }],
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
