import { NodeOperationError, type INodeProperties } from 'n8n-workflow';
import { CouchbaseVectorStore } from '@langchain/community/vectorstores/couchbase';
import { createVectorStoreNode } from '../shared/createVectorStoreNode';
import { metadataFilterField } from '../../../utils/sharedFields';
import couchbase from 'couchbase';


// const defaultQuery = 'MATCH (n) RETURN n.id as Id, n.name as Name, n.content as Content LIMIT 10'

const sharedFields: INodeProperties[] = [
	{
		displayName: 'Couchbase Index',
		name: 'couchbaseIndex',
		type: 'string',
		default: 'vector'
	}
]
const queryNameField: INodeProperties = {
	displayName: 'Query Name',
	name: 'queryName',
	type: 'string',
	default: 'match_documents',
	description: 'Name of the query to use for matching documents',
};

const insertFields: INodeProperties[] = [
	{
		displayName: 'Options',
		name: 'options',
		type: 'collection',
		placeholder: 'Add Option',
		default: {},
		options: [queryNameField],
	},
];

const retrieveFields: INodeProperties[] = [
	{
		displayName: 'Options',
		name: 'options',
		type: 'collection',
		placeholder: 'Add Option',
		default: {},
		options: [queryNameField, metadataFilterField],
	},
];
export const VectorStoreCouchbase  = createVectorStoreNode({
	meta: {
		description: 'Work with your data in Couchbase Vector Store',
		icon: 'file:CBLogomark.svg',
		displayName: 'Couchbase Vector Store',
		docsUrl:
			'https://github.com/roadgoat19/n8n-nodes-couchbasevector/blob/main/README.md',
		name: 'vectorStoreCouchbase',
		credentials: [
			{
				name: 'couchbase',
				required: true,
			},
		],
        operationModes: ['load', 'insert', 'retrieve', 'update'],
	},

    
	sharedFields,
	insertFields,
	loadFields: retrieveFields,
	retrieveFields,
	async getVectorStoreClient(context, filter, embeddings, itemIndex) {
		const indexName = context.getNodeParameter('couchbaseIndex', itemIndex, 'vector', {
			extractValue: true,
		}) as string;

		const credentials = await context.getCredentials('couchbase');
        
        const connString = credentials.connectionString as string
        const username = credentials.username as string
        const password = credentials.password as string

        const cluster = await couchbase.connect(connString, {
            username: username,
            password: password,
        })


		const config = {
			cluster: cluster, // couchbase connection
			bucketName: credentials.bucketName as string, // Name of the vector index
			scopeName: credentials.scopeName as string, // Name of the keyword index if using hybrid search
			collectionName: credentials.scopeName as string, // Type of search (e.g., vector, hybrid)
            indexName: indexName,
		  };
		
		return await CouchbaseVectorStore.initialize(embeddings, config);
	},
	async populateVectorStore(context, embeddings, documents, itemIndex) {
		const indexName = context.getNodeParameter('couchbaseIndex', itemIndex, 'vector', {
			extractValue: true,
		}) as string;

		const credentials = await context.getCredentials('couchbase');

		const connString = credentials.connectionString as string
        const username = credentials.username as string
        const password = credentials.password as string

        const cluster = await couchbase.connect(connString, {
            username: username,
            password: password,
        })


		const config = {
			cluster: cluster, // couchbase connection
			bucketName: credentials.bucketName as string, // Name of the vector index
			scopeName: credentials.scopeName as string, // Name of the keyword index if using hybrid search
			collectionName: credentials.collectionName as string, // Type of search (e.g., vector, hybrid)
            indexName: indexName,
		  };
		  		  
		try {
			await CouchbaseVectorStore.fromDocuments(documents, embeddings, config);
		} catch (error) {
			throw new NodeOperationError(context.getNode(), error as Error, {
				itemIndex,
			});
		}
	},
});