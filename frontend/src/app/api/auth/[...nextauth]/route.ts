import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";

const handler = NextAuth({
    providers: [
        GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID || "",
            clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
            authorization: {
                params: {
                    prompt: "select_account", // Always show account picker to prevent stale sessions
                },
            },
        }),
        CredentialsProvider({
            id: "role-selection",
            name: "Role Selection Completion",
            credentials: {
                token: { label: "Token", type: "text" },
                userStr: { label: "User", type: "text" }
            },
            async authorize(credentials) {
                if (credentials?.token && credentials?.userStr) {
                    try {
                        const user = JSON.parse(credentials.userStr);
                        return {
                            id: user.id,
                            name: user.name,
                            role: user.role,
                            accessToken: credentials.token,
                            backendUser: user
                        } as any;
                    } catch (e) {
                        return null;
                    }
                }
                return null;
            }
        })
    ],
    callbacks: {
        async signIn({ user, account, profile }) {
            if (account?.provider === "google") {
                try {
                    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/google`, {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({
                            email: user.email,
                            name: user.name,
                            googleId: account.providerAccountId,
                        }),
                    });

                    if (res.ok) {
                        const data = await res.json();

                        if (data.success) {
                            if (data.requireRoleSelection) {
                                const encodedEmail = encodeURIComponent(data.email);
                                const encodedName = encodeURIComponent(data.name);
                                const encodedGoogleId = encodeURIComponent(data.googleId);
                                return `/auth/role-selection?email=${encodedEmail}&name=${encodedName}&googleId=${encodedGoogleId}`;
                            }

                            if (data.token) {
                                (user as any).accessToken = data.token;
                                (user as any).backendUser = data.user;
                                return true;
                            }
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
        async jwt({ token, user, account, trigger }) {
            // On initial sign-in, store the backend data
            if (user) {
                token.accessToken = (user as any).accessToken;
                token.backendUser = (user as any).backendUser;
            }

            // On every subsequent request, re-fetch the user from the backend
            // to ensure role changes (e.g. CUSTOMER -> ADMIN) are picked up immediately
            if (token.accessToken && !user) {
                try {
                    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/me`, {
                        headers: { Authorization: `Bearer ${token.accessToken}` },
                    });
                    if (res.ok) {
                        const data = await res.json();
                        if (data.success && data.user) {
                            token.backendUser = {
                                id: data.user.id,
                                name: data.user.name,
                                role: data.user.role,
                            };
                        }
                    }
                } catch (e) {
                    // Silently fail — keep the cached backendUser
                }
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
        maxAge: 24 * 60 * 60, // 24 hours
    },
    pages: {
        signIn: '/auth',
        error: '/auth',
    }
});

export { handler as GET, handler as POST };
