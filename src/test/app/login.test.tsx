import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { http, HttpResponse } from "msw";
import { server } from "@/src/test/mocks/server";
import LoginPage from "@/src/app/(auth)/login/page";

// Mock next/navigation
const mockPush = vi.fn();
vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: mockPush }),
}));

describe("ログイン画面 (SCR-01)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  it("メールアドレス・パスワード入力欄とログインボタンが表示されること", () => {
    render(<LoginPage />);

    expect(screen.getByLabelText("メールアドレス")).toBeInTheDocument();
    expect(screen.getByLabelText("パスワード")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "ログイン" })).toBeInTheDocument();
  });

  it("入力欄が空のときログインボタンが無効であること", () => {
    render(<LoginPage />);

    expect(screen.getByRole("button", { name: "ログイン" })).toBeDisabled();
  });

  it("無効なメールアドレスでフォーカスを外すとバリデーションエラーが表示されること", async () => {
    const user = userEvent.setup();
    render(<LoginPage />);

    const emailInput = screen.getByLabelText("メールアドレス");
    await user.type(emailInput, "not-an-email");
    await user.tab();

    expect(screen.getByText("有効なメールアドレスを入力してください")).toBeInTheDocument();
  });

  it("8文字未満のパスワードでフォーカスを外すとバリデーションエラーが表示されること", async () => {
    const user = userEvent.setup();
    render(<LoginPage />);

    const passwordInput = screen.getByLabelText("パスワード");
    await user.type(passwordInput, "short");
    await user.tab();

    expect(screen.getByText("パスワードは8文字以上で入力してください")).toBeInTheDocument();
  });

  it("ログイン成功時にトークンをlocalStorageに保存し /dashboard へ遷移すること", async () => {
    const user = userEvent.setup();
    render(<LoginPage />);

    await user.type(screen.getByLabelText("メールアドレス"), "yamada@example.com");
    await user.type(screen.getByLabelText("パスワード"), "password123");
    await user.click(screen.getByRole("button", { name: "ログイン" }));

    await waitFor(() => {
      expect(localStorage.getItem("token")).toBe("mock-token");
    });
    expect(mockPush).toHaveBeenCalledWith("/dashboard");
  });

  it("ログイン失敗時にエラーメッセージが表示されること", async () => {
    server.use(
      http.post("/api/v1/auth/login", () => {
        return HttpResponse.json({ error: "Unauthorized" }, { status: 401 });
      }),
    );

    const user = userEvent.setup();
    render(<LoginPage />);

    await user.type(screen.getByLabelText("メールアドレス"), "yamada@example.com");
    await user.type(screen.getByLabelText("パスワード"), "wrongpassword");
    await user.click(screen.getByRole("button", { name: "ログイン" }));

    await waitFor(() => {
      expect(
        screen.getByText("メールアドレスまたはパスワードが正しくありません"),
      ).toBeInTheDocument();
    });
    expect(mockPush).not.toHaveBeenCalled();
  });
});
