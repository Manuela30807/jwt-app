export type Category = { id: number; name: string; description: string | null };
export type Author = { id: number; name: string; nationality: string | null; birthDate: string | null };
export type Book = {
  id: number;
  title: string;
  isbn: string;
  year: number | null;
  totalCopies: number;
  availableCopies: number;
  categoryId: number;
  category?: Category;
  authors?: Author[];
};
export type Reader = { id: number; name: string; cpf: string; email: string | null; phone: string | null };
export type Attendant = {
  id: number;
  name: string;
  username: string;
  email: string;
  isAdmin: boolean;
  active: boolean;
};
export type LoanStatus = "ATIVO" | "ATRASADO" | "DEVOLVIDO";
export type Loan = {
  id: number;
  loanDate: string;
  dueDate: string;
  returnDate: string | null;
  status: LoanStatus;
  fine: number;
  currentFine?: number;
  daysLate?: number;
  book?: { id: number; title: string; isbn: string };
  reader?: { id: number; name: string; cpf: string };
  attendant?: { id: number; name: string };
};
export type DashboardData = {
  totalBooks: number;
  totalCopies: number;
  availableCopies: number;
  borrowedCopies: number;
  activeLoans: number;
  overdueLoans: number;
  totalFines: number;
  pendingFines: number;
};
