import NextAuth from 'next-auth'
import GoogleProvider from 'next-auth/providers/google'
import { MongoDBAdapter } from '@auth/mongodb-adapter'
import { MongoClient } from 'mongodb'

const client = new MongoClient(process.env.MONGODB_URI)

export const authOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    })
  ],
  adapter: MongoDBAdapter(client),
  session: { strategy: 'jwt' },
  callbacks: {
    session: async ({ session, token }) => {
      session.userId = token.sub
      return session
    },
    jwt: async ({ token, user }) => {
      if (user) token.sub = user.id
      return token
    }
  }
}

const handler = NextAuth(authOptions)
export { handler as GET, handler as POST }
