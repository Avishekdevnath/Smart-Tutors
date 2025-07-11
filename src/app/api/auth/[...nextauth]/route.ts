import NextAuth from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { dbConnect } from '@/lib/mongodb';
import User from '@/models/User';
import Tutor from '@/models/Tutor';
import Admin from '@/models/Admin';
import bcrypt from 'bcryptjs';

export const authOptions = {
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        username: { label: 'Username or Phone/Email', type: 'text' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        await dbConnect();
        if (!credentials?.username || !credentials?.password) {
          return null;
        }

        // First, try to find admin by username
        const admin = await Admin.findOne({ username: credentials.username });
        if (admin) {
          // Check if admin account is locked
          if (admin.isLocked && admin.isLocked()) {
            return null;
          }

          // Check password for admin
          const isValidAdmin = await admin.comparePassword(credentials.password);
          if (isValidAdmin) {
            // Reset login attempts on successful login
            await admin.resetLoginAttempts();
            
            return {
              id: admin._id.toString(),
              username: admin.username,
              email: admin.email,
              name: admin.name,
              isAdmin: true,
              userType: 'admin',
            };
          } else {
            // Increment login attempts on failed login
            await admin.incLoginAttempts();
            return null;
          }
        }

        // If not admin, try to find user by username (legacy)
        let user = await User.findOne({ username: credentials.username });
        
        // If not found, try to find by phone/email for tutors
        if (!user) {
          // Try to find tutor by phone or email
          const tutor = await Tutor.findOne({
            $or: [
              { phone: credentials.username },
              { email: credentials.username },
            ],
          });
          
          if (tutor) {
            // Find corresponding user account
            user = await User.findOne({ 
              tutorId: tutor._id, 
              userType: 'tutor' 
            });
          }
        }

        if (!user) return null;
        
        const isValid = await bcrypt.compare(credentials.password, user.password);
        if (!isValid) return null;

        // Get tutor profile data if user is a tutor
        let tutorProfile = null;
        if (user.userType === 'tutor' && user.tutorId) {
          tutorProfile = await Tutor.findById(user.tutorId);
        }

        return {
          id: user._id.toString(),
          username: user.username,
          email: tutorProfile?.email || user.email,
          name: tutorProfile?.name || user.username,
          isAdmin: user.isAdmin || false,
          userType: user.userType,
          tutorId: user.tutorId?.toString(),
        };
      },
    }),
  ],
  session: {
    strategy: 'jwt',
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.username = (user as any).username;
        token.email = (user as any).email;
        token.name = (user as any).name;
        token.isAdmin = (user as any).isAdmin;
        token.userType = (user as any).userType;
        token.tutorId = (user as any).tutorId;
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user = {
          id: token.id,
          username: token.username,
          email: token.email,
          name: token.name,
          isAdmin: token.isAdmin,
          userType: token.userType,
          tutorId: token.tutorId,
        } as any;
      }
      return session;
    },
    async redirect({ url, baseUrl, token }) {
      // If user is signing in
      if (url === baseUrl || url === `${baseUrl}/`) {
        // Check user type from token or URL parameters to determine redirect
        const userType = token?.userType;
        
        if (userType === 'admin') {
          return `${baseUrl}/dashboard`;
        } else if (userType === 'tutor') {
          return `${baseUrl}/tutor/dashboard`;
        }
      }
      
      // Allow relative callback URLs
      if (url.startsWith('/')) return `${baseUrl}${url}`;
      
      // Allow callback URLs on the same origin
      if (new URL(url).origin === baseUrl) return url;
      
      return baseUrl;
    },
  },
  pages: {
    signIn: '/tutors/login',
  },
  secret: process.env.NEXTAUTH_SECRET,
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST }; 