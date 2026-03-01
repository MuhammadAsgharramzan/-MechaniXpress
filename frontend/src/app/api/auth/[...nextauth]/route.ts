import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";

const handler = NextAuth({
    providers: [
        GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID || "",
            clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
        }),
    ],
    callbacks: {
        async signIn({ user, account, profile }) {
            if (account?.provider === "google") {
                // Send a request to our backend API to log in or register the Google user
                try {
                    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/google`, {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json",
                        },
                        body: JSON.stringify({
                            email: user.email,
                            name: user.name,
                            googleId: account.providerAccountId,
                        }),
                    });

                    if (res.ok) {
                        const data = await res.json();
                        if (data.success && data.token) {
                            // Store the backend token temporarily in the user object
                            // So that the jwt callback can attach it to the session
                            (user as any).accessToken = data.token;
                            (user as any).backendUser = data.user;
                            return true;
                        }
                    }
                    return false;
                } catch (error) {
                    console.error("Google Auth Backend Connection Error:", error);
                    return false;
                }
            }
            return true;
        },
        async jwt({ token, user }) {
            if (user) {
                token.accessToken = (user as any).accessToken;
                token.backendUser = (user as any).backendUser;
            }
            return token;
        },
        async session({ session, token }) {
            (session as any).accessToken = token.accessToken;
            (session as any).backendUser = token.backendUser;
            return session;
        },
    },
    session: {
        strategy: "jwt",
    },
    pages: {
        signIn: '/auth',
        error: '/auth', // Redirect here if signIn fails
    }
});

export { handler as GET, handler as POST };
