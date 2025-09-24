import { useState, useCallback, useEffect } from "react";
import {
  generateMergeCode,
  validateMergeCode,
  mergeAccounts,
} from "wasp/client/operations";
import { Button } from "../shared/components/Button";
import { Link } from "wasp/client/router";

function TabButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={`border-b-2 px-4 py-2 font-medium ${
        active
          ? "border-neutral-700 text-neutral-700"
          : "border-transparent text-neutral-600 hover:text-neutral-800"
      }`}
      aria-current={active ? "page" : undefined}
    >
      {children}
    </button>
  );
}

export const AccountMergePage = () => {
  const [activeTab, setActiveTab] = useState<"generate" | "merge">("generate");

  return (
    <div className="flex flex-col items-center gap-8 px-8 py-12">
      <div className="w-full max-w-2xl">
        <h1 className="mb-2 text-4xl font-bold">Account Merging</h1>
        <p className="mb-8 text-neutral-600">
          Generate a code with the source account or use a code to merge a
          source account into this target account.
        </p>

        <div className="mb-6 flex border-b">
          <TabButton
            active={activeTab === "generate"}
            onClick={() => setActiveTab("generate")}
          >
            Generate Code
          </TabButton>
          <TabButton
            active={activeTab === "merge"}
            onClick={() => setActiveTab("merge")}
          >
            Use Code
          </TabButton>
        </div>

        <div className="card p-6">
          {activeTab === "generate" ? (
            <GenerateCodeSection />
          ) : (
            <MergeCodeSection />
          )}
        </div>

        <div className="mt-8 text-center">
          <Link to="/" className="text-neutral-500 hover:text-neutral-600">
            ← Back to Tasks
          </Link>
        </div>
      </div>
    </div>
  );
};

function GenerateCodeSection() {
  const [code, setCode] = useState<string | null>(null);
  const [expiresAt, setExpiresAt] = useState<Date | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const handleGenerateCode = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await generateMergeCode();
      setCode(result.code);
      setExpiresAt(result.expiresAt);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to generate merge code",
      );
    } finally {
      setLoading(false);
    }
  }, []);

  const copyToClipboard = useCallback(async () => {
    if (!code) return;
    await navigator.clipboard.writeText(code);
    setCopied(true);
    // reset after a short delay
    window.setTimeout(() => setCopied(false), 1500);
  }, [code]);

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">Generate Merge Code</h2>
      <p className="text-neutral-600">
        Generate a code from the source account (the account you want to merge).
        You can then use this code in the target account (the account you want
        to keep) to merge the two accounts together.
      </p>

      {!code ? (
        <div>
          <Button
            onClick={handleGenerateCode}
            disabled={loading}
            className="w-full"
          >
            {loading ? "Generating..." : "Generate Merge Code"}
          </Button>
          {error && (
            <div
              className="mt-4 rounded-md border border-red-200 bg-red-50 p-4"
              aria-live="polite"
            >
              <p className="text-red-600">{error}</p>
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          <div className="rounded-md border border-neutral-200 bg-neutral-50 p-4">
            <p className="mb-2 font-medium text-neutral-800">Merge code:</p>
            <div className="flex items-center gap-2">
              <code className="flex-1 rounded-lg border bg-white p-2 font-mono text-lg">
                {code}
              </code>
              <Button onClick={copyToClipboard} variant="ghost">
                {copied ? "Copied!" : "Copy"}
              </Button>
            </div>
            <p className="mt-2 text-sm text-neutral-600">
              Expires: {expiresAt ? new Date(expiresAt).toLocaleString() : "-"}
            </p>
          </div>
          <div className="rounded-md border p-4">
            <h3 className="mb-2 font-medium">Instructions:</h3>
            <ol className="space-y-1 text-sm">
              <li>1. Log out of this account</li>
              <li>2. Log into the target account (the one you want to KEEP)</li>
              <li>
                3. Go to Account Merging and use the &quot;Use Code&quot; tab
              </li>
              <li>
                4. Enter this code to merge this source account into that target
                account
              </li>
            </ol>
          </div>
          <Button
            onClick={() => {
              setCode(null);
              setExpiresAt(null);
              setError(null);
              setCopied(false);
            }}
            variant="ghost"
            className="w-full"
            disabled={loading}
          >
            Generate New Code
          </Button>
        </div>
      )}
    </div>
  );
}

function MergeCodeSection() {
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [validationResult, setValidationResult] = useState<{
    valid: boolean;
    sourceUserId?: string;
  } | null>(null);
  const [mergeComplete, setMergeComplete] = useState(false);

  // Clear previous validation/error on input change for clarity
  useEffect(() => {
    setError(null);
    setValidationResult(null);
  }, [code]);

  const handleValidateCode = useCallback(async () => {
    const trimmedCode = code.trim().toUpperCase();
    if (!trimmedCode) return;

    setLoading(true);
    setError(null);
    setValidationResult(null);

    try {
      const result = await validateMergeCode({ code: trimmedCode });
      setValidationResult(result);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to validate merge code",
      );
    } finally {
      setLoading(false);
    }
  }, [code]);

  const handleMergeAccounts = useCallback(async () => {
    const trimmedCode = code.trim().toUpperCase();
    if (!trimmedCode) return;

    setLoading(true);
    setError(null);

    try {
      const result = await mergeAccounts({ code: trimmedCode });
      if (result.success) {
        setMergeComplete(true);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to merge accounts");
    } finally {
      setLoading(false);
    }
  }, [code]);

  if (mergeComplete) {
    return (
      <div className="space-y-4 text-center" aria-live="polite">
        <div className="mb-4 rounded-md border border-neutral-200 bg-neutral-50 p-6">
          <h2 className="mb-2 text-xl font-semibold text-neutral-800">
            Accounts Merged Successfully
          </h2>
          <p className="text-neutral-700">
            The source account has been merged into this target account. All
            tasks and data have been transferred.
          </p>
        </div>
        <Link to="/">
          <Button className="w-full">View Your Tasks</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">Use Merge Code</h2>
      <p className="text-neutral-600">
        Enter a merge code from a source account to merge it into this target
        account. All tasks and data from the source account will be moved here.
      </p>

      <div className="space-y-4">
        <div className="flex gap-2">
          <input
            type="text"
            value={code}
            onChange={(e) => setCode(e.target.value.toUpperCase())}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                if (validationResult?.valid) handleMergeAccounts();
                else handleValidateCode();
              }
            }}
            placeholder="Enter merge code"
            className="w-full flex-1 rounded-md border border-neutral-300 bg-white px-3 py-2 font-mono text-neutral-800 shadow-sm focus:border-neutral-500 focus:outline-none focus:ring-1 focus:ring-neutral-500"
            maxLength={8}
            aria-label="Merge code"
          />
          <Button
            onClick={handleValidateCode}
            disabled={loading || !code.trim()}
            variant="primary"
          >
            {loading ? "Validating..." : "Validate"}
          </Button>
        </div>

        {error && (
          <div
            className="rounded-md border border-red-200 bg-red-50 p-4"
            aria-live="polite"
          >
            <p className="text-red-600">{error}</p>
          </div>
        )}

        {validationResult && !validationResult.valid && (
          <div
            className="rounded-md border border-red-200 bg-red-50 p-4"
            aria-live="polite"
          >
            <p className="text-red-600">Invalid or expired merge code</p>
          </div>
        )}

        {validationResult && validationResult.valid && (
          <div className="space-y-4" aria-live="polite">
            <div className="rounded-md border border-neutral-200 bg-neutral-50 p-4">
              <h3 className="mb-2 font-medium text-neutral-800">⚠️ Warning:</h3>
              <p className="text-sm text-neutral-700">
                This action cannot be undone. The source account will be
                permanently deleted, and all its data will be moved to your
                current account.
              </p>
            </div>
            <Button
              onClick={handleMergeAccounts}
              disabled={loading}
              className="w-full"
              variant="danger"
            >
              {loading ? "Merging..." : "Confirm Account Merge"}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
