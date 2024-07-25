import {
	ICredentialType,
	INodeProperties,
	IAuthenticateGeneric
} from 'n8n-workflow';


export class Couchbase implements ICredentialType {
	name = 'couchbase';
	displayName = 'Couchbase';
	documentationUrl = "https://docs.couchbase.com/server/current/guides/connect.html";
	properties: INodeProperties[] = [
		// The credentials to get from user and save encrypted.
		// Properties can be defined exactly in the same way
		// as node properties.
		{
			displayName: 'Connection String',
			name: 'connectionString',
			type: 'string',
			default: '127.0.0.1',
		},
        {
			displayName: 'Username',
			name: 'username',
			type: 'string',
			default: 'Administrator',
		},
		{
			displayName: 'Password',
			name: 'password',
			type: 'string',
			typeOptions: {
				password: true,
			},
			default: 'password',
		},
		{
			displayName: 'Bucket',
			name: 'bucketName',
			type: 'string',
			default: 'n8n',
		},
		{
			displayName: 'Scope',
			name: 'scopeName',
			type: 'string',
			default: '_default',
		},
        {
			displayName: 'Collection',
			name: 'collectionName',
			type: 'string',
			default: '_default',
		},
	];
	authenticate: IAuthenticateGeneric = {
		type: 'generic',
		properties: {
			auth: {
				username: '={{$credentials.username}}',
				password: '={{$credentials.password}}',
			},
		},
	};
}
