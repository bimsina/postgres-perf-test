import { createClient } from '@supabase/supabase-js';
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { pgTable, serial, text } from 'drizzle-orm/pg-core';

const usersTable = pgTable('users', {
	id: serial('id').primaryKey(),
	name: text('name').notNull(),
	email: text('email').notNull(),
});
export default {
	async fetch(request, env, ctx): Promise<Response> {
		const url = new URL(request.url);
		if (url.pathname === '/supabasejs') {
			const supabase = createClient(
				'http://127.0.0.1:54321',
				'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0'
			);
			const { data, error } = await supabase.from('users').select().limit(100);
			if (error) return new Response(error.message, { status: 500 });

			return new Response(JSON.stringify(data), {
				headers: {
					'content-type': 'application/json',
				},
			});
		} else if (url.pathname === '/drizzle') {
			const client = postgres('postgresql://postgres:postgres@127.0.0.1:54322/postgres');

			const db = drizzle(client, {
				schema: {
					usersTable,
				},
			});
			const users = await db.query.usersTable.findMany({
				limit: 100,
			});
			return new Response(JSON.stringify(users), {
				headers: {
					'content-type': 'application/json',
				},
			});
		}
		return new Response('Hello World!');
	},
} satisfies ExportedHandler<Env>;
