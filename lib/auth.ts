export interface User {
  id: string;
  email: string;
  displayName: string;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
}

export class AuthService {
  private static readonly USERS_KEY = 'pagepilot_users';
  private static readonly SESSION_KEY = 'pagepilot_session';

  static getUsers(): Record<string, User> {
    if (typeof window === 'undefined') return {};
    const users = localStorage.getItem(this.USERS_KEY);
    return users ? JSON.parse(users) : {};
  }

  static saveUsers(users: Record<string, User>): void {
    if (typeof window === 'undefined') return;
    localStorage.setItem(this.USERS_KEY, JSON.stringify(users));
  }

  static getSession(): AuthState {
    if (typeof window === 'undefined') return { user: null, isAuthenticated: false };
    const session = localStorage.getItem(this.SESSION_KEY);
    return session ? JSON.parse(session) : { user: null, isAuthenticated: false };
  }

  static saveSession(authState: AuthState): void {
    if (typeof window === 'undefined') return;
    localStorage.setItem(this.SESSION_KEY, JSON.stringify(authState));
  }

  static clearSession(): void {
    if (typeof window === 'undefined') return;
    localStorage.removeItem(this.SESSION_KEY);
  }

  static signup(email: string, password: string, displayName: string): { success: boolean; error?: string; user?: User } {
    const users = this.getUsers();
    
    // Check if user already exists
    if (users[email]) {
      return { success: false, error: 'User already exists with this email' };
    }

    // Create new user
    const newUser: User = {
      id: Date.now().toString(),
      email,
      displayName,
    };

    // Save user and password (in real app, hash the password)
    users[email] = newUser;
    this.saveUsers(users);
    
    // Store password separately (in real app, this would be hashed)
    const passwords = this.getPasswords();
    passwords[email] = password;
    this.savePasswords(passwords);

    // Auto-login after signup
    const authState: AuthState = { user: newUser, isAuthenticated: true };
    this.saveSession(authState);

    return { success: true, user: newUser };
  }

  static login(email: string, password: string): { success: boolean; error?: string; user?: User } {
    const users = this.getUsers();
    const passwords = this.getPasswords();

    const user = users[email];
    const storedPassword = passwords[email];

    if (!user || storedPassword !== password) {
      return { success: false, error: 'Invalid email or password' };
    }

    // Set session
    const authState: AuthState = { user, isAuthenticated: true };
    this.saveSession(authState);

    return { success: true, user };
  }

  static logout(): void {
    this.clearSession();
  }

  static updateDisplayName(newDisplayName: string): { success: boolean; user?: User } {
    const session = this.getSession();
    if (!session.isAuthenticated || !session.user) {
      return { success: false };
    }

    const users = this.getUsers();
    const updatedUser = { ...session.user, displayName: newDisplayName };
    users[session.user.email] = updatedUser;
    this.saveUsers(users);

    // Update session
    const authState: AuthState = { user: updatedUser, isAuthenticated: true };
    this.saveSession(authState);

    return { success: true, user: updatedUser };
  }

  private static getPasswords(): Record<string, string> {
    if (typeof window === 'undefined') return {};
    const passwords = localStorage.getItem('pagepilot_passwords');
    return passwords ? JSON.parse(passwords) : {};
  }

  private static savePasswords(passwords: Record<string, string>): void {
    if (typeof window === 'undefined') return;
    localStorage.setItem('pagepilot_passwords', JSON.stringify(passwords));
  }
}