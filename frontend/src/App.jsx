import {
  Box, Container, Flex, HStack, Spacer, InputGroup, InputLeftElement, Input,
  Heading, Text, Link as ChakraLink, FormControl, FormLabel, VStack, Switch,
  Button, IconButton, useColorModeValue, Divider, useToast, Card, CardBody,
  Stack, Badge, Skeleton, Stat, StatLabel, StatNumber, StatHelpText
} from "@chakra-ui/react";
import { SearchIcon, MinusIcon, AddIcon } from "@chakra-ui/icons";
import { useEffect, useMemo, useState, useCallback, useContext, createContext } from "react";
import { Routes, Route, NavLink, useNavigate, Navigate } from "react-router-dom";

/* API paths (relative — works in prod and with Vite proxy in dev) */
const API_USER = "/api/user";
const API_DAILY = "/api/daily-entry";
const API_STREAK = "/api/streak";

const AuthCtx = createContext(null);
function useAuth() { return useContext(AuthCtx); }

function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem("token") || "");
  const [user, setUser] = useState(null);
  const toast = useToast();
  const isAuthed = !!token;

  const saveToken = useCallback((t) => {
    setToken(t || "");
    if (t) localStorage.setItem("token", t);
    else localStorage.removeItem("token");
  }, []);

  const logout = useCallback(() => {
    saveToken("");
    setUser(null);
    toast({ status: "info", title: "Logged out" });
  }, [saveToken, toast]);

  const authFetch = useCallback(async (path, opts = {}) => {
    const headers = new Headers(opts.headers || {});
    if (token) headers.set("Authorization", `Bearer ${token}`);
    const method = (opts.method || "GET").toUpperCase();
    if (!headers.has("Content-Type") && !(opts.body instanceof FormData) && method !== "GET") {
      headers.set("Content-Type", "application/json");
    }
    const res = await fetch(path, { ...opts, headers });
    if (res.status === 401) logout();
    return res;
  }, [token, logout]);

  const value = { token, user, setUser, isAuthed, saveToken, logout, authFetch };
  return <AuthCtx.Provider value={value}>{children}</AuthCtx.Provider>;
}

function NavBar() {
  const { isAuthed, logout, user } = useAuth();
  return (
    <Box as="header" borderBottom="1px solid"
         borderColor={useColorModeValue("green.100", "green.900")}
         bg={useColorModeValue("green.50", "green.900")} py={3}>
      <Container maxW="6xl">
        <Flex align="center" gap={4}>
          <Heading as="h1" size="md" color="green.700">Greenify 🌿</Heading>
          <HStack as="nav" spacing={4}>
            <ChakraLink as={NavLink} to="/" _activeLink={{ color: "green.600" }}>Home</ChakraLink>
            <ChakraLink as={NavLink} to="/about" _activeLink={{ color: "green.600" }}>About</ChakraLink>
            <ChakraLink as={NavLink} to="/contact" _activeLink={{ color: "green.600" }}>Contact</ChakraLink>
            {isAuthed && <ChakraLink as={NavLink} to="/account" _activeLink={{ color: "green.600" }}>Account</ChakraLink>}
          </HStack>
          <Spacer />
          <InputGroup maxW="sm" display={{ base: "none", md: "block" }}>
            <InputLeftElement pointerEvents="none"><SearchIcon color="green.500" /></InputLeftElement>
            <Input placeholder="Search…" focusBorderColor="green.500" />
          </InputGroup>
          <HStack>
            {!isAuthed ? (
              <>
                <Button as={NavLink} to="/login" size="sm" colorScheme="green" variant="outline">Log in</Button>
                <Button as={NavLink} to="/register" size="sm" colorScheme="green">Sign up</Button>
              </>
            ) : (
              <>
                <Text color="green.700" fontSize="sm">{user?.username ? `Hi, ${user.username}` : "Signed in"}</Text>
                <Button size="sm" colorScheme="green" variant="outline" onClick={logout}>Logout</Button>
              </>
            )}
          </HStack>
        </Flex>
      </Container>
    </Box>
  );
}

function Page({ title, children }) {
  return (
    <Container maxW="6xl" py={8}>
      <Heading mb={4} color="green.700">{title}</Heading>
      {children}
    </Container>
  );
}

function CounterRow({ label, value, onDecr, onIncr }) {
  const borderCol = useColorModeValue("green.200", "green.700");
  const bg = useColorModeValue("green.50", "green.900");
  return (
    <FormControl>
      <FormLabel color="green.700">{label}</FormLabel>
      <Flex align="center" gap={3} borderWidth="1px" borderColor={borderCol} rounded="md" px={3} py={2} bg={bg}>
        <IconButton aria-label="decrease" icon={<MinusIcon />} onClick={onDecr} colorScheme="green" variant="outline" size="sm" />
        <Text fontSize="lg" minW="3ch" textAlign="center" color="green.800">{value}</Text>
        <IconButton aria-label="increase" icon={<AddIcon />} onClick={onIncr} colorScheme="green" size="sm" />
      </Flex>
    </FormControl>
  );
}

function StreakCard() {
  const { authFetch, isAuthed } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const borderCol = useColorModeValue("green.200", "green.700");

  useEffect(() => {
    let ignore = false;
    (async () => {
      if (!isAuthed) { setLoading(false); return; }
      setLoading(true);
      const res = await authFetch(API_STREAK);
      if (!ignore) {
        if (res.ok) setData(await res.json().catch(() => null));
        setLoading(false);
      }
    })();
    return () => { ignore = true; };
  }, [authFetch, isAuthed]);

  if (!isAuthed) return null;

  return (
    <Card borderWidth="1px" borderColor={borderCol} mb={6}>
      <CardBody>
        <Heading size="sm" color="green.700" mb={3}>Your Streak</Heading>
        {loading ? (
          <Skeleton height="20px" />
        ) : data ? (
          <HStack spacing={4}>
            {"current" in data && <Badge colorScheme="green">Current: {data.current}</Badge>}
            {"longest" in data && <Badge colorScheme="green">Longest: {data.longest}</Badge>}
          </HStack>
        ) : (
          <Text color="green.800">No streak data yet.</Text>
        )}
      </CardBody>
    </Card>
  );
}

function Home() {
  const { authFetch, isAuthed } = useAuth();
  const toast = useToast();

  const [trashCount, setTrashCount] = useState(0);
  const [recycleCount, setRecycleCount] = useState(0);
  const [milesDriven, setMilesDriven] = useState(0);
  const [reusableBottle, setReusableBottle] = useState(false);
  const [reusableBag, setReusableBag] = useState(false);
  const [savedPoints, setSavedPoints] = useState(null);

  const cardBg = useColorModeValue("white", "gray.800");
  const pageBg = useColorModeValue("green.50", "green.950");
  const borderCol = useColorModeValue("green.200", "green.700");
  const safeDec = (n) => Math.max(0, n - 1);
  const todayISO = new Date().toISOString().slice(0, 10);

  const projectedPoints = useMemo(() => {
    const miles = Number.isFinite(+milesDriven) ? +milesDriven : 0;
    let pts = 0;
    pts += recycleCount * 2;
    pts -= trashCount * 1;
    pts -= Math.round(miles * 0.2);
    if (reusableBag) pts += 3;
    if (reusableBottle) pts += 3;
    return Math.max(0, pts);
  }, [trashCount, recycleCount, milesDriven, reusableBag, reusableBottle]);

  useEffect(() => {
    let ignore = false;
    (async () => {
      if (!isAuthed) return;
      const res = await authFetch(`${API_DAILY}/${todayISO}`);
      if (!res.ok) return;
      const view = await res.json();
      const raw = view?.raw;
      if (!ignore && raw) {
        setTrashCount(raw.trashCount ?? 0);
        setRecycleCount(raw.recycleCount ?? 0);
        setMilesDriven(raw.milesDriven ?? 0);
        setReusableBag(!!raw.reusableBag);
        setReusableBottle(!!raw.reusableBottle);
        if (typeof view.pointsTotal === "number") setSavedPoints(view.pointsTotal);
      }
    })();
    return () => { ignore = true; };
  }, [authFetch, isAuthed, todayISO]);

  const onSave = async () => {
    if (!isAuthed) {
      toast({ status: "warning", title: "Please log in to save your entry." });
      return;
    }
    const dto = {
      date: todayISO,
      milesDriven: Number.isFinite(+milesDriven) ? +milesDriven : 0,
      trashCount,
      recycleCount,
      reusableBag,
      reusableBottle,
    };
    try {
      const res = await authFetch(API_DAILY, { method: "POST", body: JSON.stringify(dto) });
      if (!res.ok) throw new Error((await res.text().catch(() => "")) || `Save failed (${res.status})`);
      const view = await res.json().catch(() => null);
      if (view && typeof view.pointsTotal === "number") setSavedPoints(view.pointsTotal);
      toast({ status: "success", title: "Saved today's entry" });
    } catch (e) {
      toast({ status: "error", title: "Error saving entry", description: e.message });
    }
  };

  return (
    <Box bg={pageBg} py={6} rounded="lg">
      <Page title="Daily Impact Tracker">
        <Box mb={6} p={4} bg={useColorModeValue("green.50", "green.900")}
             borderWidth="1px" borderColor={borderCol} rounded="xl">
          <Flex gap={8} wrap="wrap">
            <Stat>
              <StatLabel color="green.700">Projected points (live)</StatLabel>
              <StatNumber color="green.800">{projectedPoints}</StatNumber>
              <StatHelpText color="green.700">Estimated from current inputs</StatHelpText>
            </Stat>
            <Stat>
              <StatLabel color="green.700">Saved points</StatLabel>
              <StatNumber color="green.800">{savedPoints ?? "—"}</StatNumber>
              <StatHelpText color="green.700">From server</StatHelpText>
            </Stat>
          </Flex>
        </Box>

        <Box bg={cardBg} borderWidth="1px" borderColor={borderCol} rounded="xl" p={6} shadow="sm">
          <VStack spacing={6} align="stretch">
            <CounterRow
              label="How many times did you throw away trash today?"
              value={trashCount}
              onDecr={() => setTrashCount((n) => safeDec(n))}
              onIncr={() => setTrashCount((n) => n + 1)}
            />

            <FormControl>
              <FormLabel color="green.700">How many miles did you drive today?</FormLabel>
              <Input
                type="number"
                placeholder="Enter miles"
                value={milesDriven}
                onChange={(e) => setMilesDriven(e.target.value)}
                focusBorderColor="green.500"
              />
            </FormControl>

            <Divider borderColor={borderCol} />

            <FormControl display="flex" alignItems="center" justifyContent="space-between">
              <FormLabel mb="0" color="green.700">Do you use a reusable bottle for water?</FormLabel>
              <Switch colorScheme="green" isChecked={reusableBottle}
                      onChange={(e) => setReusableBottle(e.target.checked)} />
            </FormControl>

            <FormControl display="flex" alignItems="center" justifyContent="space-between">
              <FormLabel mb="0" color="green.700">Do you use a reusable bag for groceries?</FormLabel>
              <Switch colorScheme="green" isChecked={reusableBag}
                      onChange={(e) => setReusableBag(e.target.checked)} />
            </FormControl>

            <CounterRow
              label="How many times did you recycle today?"
              value={recycleCount}
              onDecr={() => setRecycleCount((n) => safeDec(n))}
              onIncr={() => setRecycleCount((n) => n + 1)}
            />

            <Box mt={2} p={4} borderWidth="1px" borderColor={borderCol}
                 rounded="md" bg={useColorModeValue("green.50", "green.900")}>
              <Text color="green.800">
                <strong>Today’s summary:</strong> Trash: {trashCount} | Miles: {milesDriven || 0} |
                Reusable bottle: {reusableBottle ? "Yes" : "No"} | Reusable bag: {reusableBag ? "Yes" : "No"} |
                Recycle: {recycleCount}
              </Text>
            </Box>

            <Flex justify="flex-end" gap={3}>
              <Button
                variant="outline"
                colorScheme="green"
                onClick={() => {
                  setTrashCount(0);
                  setRecycleCount(0);
                  setMilesDriven(0);
                  setReusableBottle(false);
                  setReusableBag(false);
                }}
              >
                Reset
              </Button>
              <Button colorScheme="green" onClick={onSave}>Save</Button>
            </Flex>
          </VStack>
        </Box>

        <StreakCard />
      </Page>
    </Box>
  );
}

function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const { saveToken, authFetch, setUser } = useAuth();
  const toast = useToast(); const nav = useNavigate();

  const onSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`${API_USER}/login`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });
      if (!res.ok) throw new Error(res.status === 401 ? "Invalid credentials" : "Login failed");
      const token = await res.text();
      saveToken(token);
      const meRes = await authFetch(`${API_USER}/me`);
      if (meRes.ok) setUser(await meRes.json());
      toast({ status: "success", title: "Logged in" }); nav("/");
    } catch (err) { toast({ status: "error", title: "Login error", description: err.message }); }
  };

  return (
    <Page title="Log in">
      <Card borderColor={useColorModeValue("green.200", "green.700")} borderWidth="1px">
        <CardBody>
          <form onSubmit={onSubmit}>
            <Stack spacing={5}>
              <FormControl isRequired><FormLabel>Username</FormLabel>
                <Input value={username} onChange={(e) => setUsername(e.target.value)} focusBorderColor="green.500" />
              </FormControl>
              <FormControl isRequired><FormLabel>Password</FormLabel>
                <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} focusBorderColor="green.500" />
              </FormControl>
              <Button colorScheme="green" type="submit">Log in</Button>
            </Stack>
          </form>
        </CardBody>
      </Card>
    </Page>
  );
}

function Register() {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const toast = useToast(); const nav = useNavigate();

  const onSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`${API_USER}/register`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, email, password }),
      });
      if (!res.ok) throw new Error((await res.text()) || "Registration failed");
      toast({ status: "success", title: "Account created" }); nav("/login");
    } catch (err) { toast({ status: "error", title: "Registration error", description: err.message }); }
  };

  return (
    <Page title="Sign up">
      <Card borderColor={useColorModeValue("green.200", "green.700")} borderWidth="1px">
        <CardBody>
          <form onSubmit={onSubmit}>
            <Stack spacing={5}>
              <FormControl isRequired><FormLabel>Username</FormLabel>
                <Input value={username} onChange={(e) => setUsername(e.target.value)} focusBorderColor="green.500" />
              </FormControl>
              <FormControl isRequired><FormLabel>Email</FormLabel>
                <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} focusBorderColor="green.500" />
              </FormControl>
              <FormControl isRequired><FormLabel>Password</FormLabel>
                <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} focusBorderColor="green.500" />
              </FormControl>
              <Button colorScheme="green" type="submit">Create account</Button>
            </Stack>
          </form>
        </CardBody>
      </Card>
    </Page>
  );
}

function Account() {
  const { user, setUser, authFetch, logout } = useAuth();
  const [loading, setLoading] = useState(false);
  const [newUsername, setNewUsername] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const toast = useToast();

  useEffect(() => { (async () => {
    const res = await authFetch(`${API_USER}/me`); if (res.ok) setUser(await res.json());
  })(); }, [authFetch, setUser]);

  const changeUsername = async () => {
    if (!newUsername) return; setLoading(true);
    try {
      const res = await authFetch(`${API_USER}/me/username`, { method: "PUT", body: JSON.stringify({ newUsername }) });
      if (!res.ok) throw new Error(await res.text());
      toast({ status: "success", title: "Username changed" });
      const me = await (await authFetch(`${API_USER}/me`)).json(); setUser(me); setNewUsername("");
    } catch (e) { toast({ status: "error", title: "Error", description: e.message }); }
    finally { setLoading(false); }
  };

  const changePassword = async () => {
    if (!newPassword) return; setLoading(true);
    try {
      const res = await authFetch(`${API_USER}/me/password`, { method: "PUT", body: JSON.stringify({ newPassword }) });
      if (!res.ok) throw new Error(await res.text());
      toast({ status: "success", title: "Password changed" }); setNewPassword("");
    } catch (e) { toast({ status: "error", title: "Error", description: e.message }); }
    finally { setLoading(false); }
  };

  const deleteMe = async () => {
    if (!confirm("Delete your account? This cannot be undone.")) return; setLoading(true);
    try {
      const res = await authFetch(`${API_USER}/me`, { method: "DELETE" });
      if (!res.ok) throw new Error(await res.text());
      toast({ status: "success", title: "Account deleted" }); logout();
    } catch (e) { toast({ status: "error", title: "Error", description: e.message }); }
    finally { setLoading(false); }
  };

  return (
    <Page title="Account">
      <VStack align="stretch" spacing={6}>
        <Box>
          <Text color="green.700"><strong>Username:</strong> {user?.username ?? "—"}</Text>
          <Text color="green.700"><strong>Email:</strong> {user?.email ?? "—"}</Text>
        </Box>

        <Card borderColor={useColorModeValue("green.200", "green.700")} borderWidth="1px">
          <CardBody>
            <VStack align="stretch" spacing={4}>
              <Heading size="sm" color="green.700">Change username</Heading>
              <Input placeholder="New username" value={newUsername}
                     onChange={(e) => setNewUsername(e.target.value)} focusBorderColor="green.500" />
              <Button colorScheme="green" onClick={changeUsername} isLoading={loading}>Update Username</Button>
            </VStack>
          </CardBody>
        </Card>

        <Card borderColor={useColorModeValue("green.200", "green.700")} borderWidth="1px">
          <CardBody>
            <VStack align="stretch" spacing={4}>
              <Heading size="sm" color="green.700">Change password</Heading>
              <Input type="password" placeholder="New password" value={newPassword}
                     onChange={(e) => setNewPassword(e.target.value)} focusBorderColor="green.500" />
              <Button colorScheme="green" onClick={changePassword} isLoading={loading}>Update Password</Button>
            </VStack>
          </CardBody>
        </Card>

        <Flex justify="flex-end">
          <Button colorScheme="red" variant="outline" onClick={deleteMe} isLoading={loading}>Delete Account</Button>
        </Flex>
      </VStack>
    </Page>
  );
}

function ProtectedRoute({ children }) {
  const { isAuthed } = useAuth();
  if (!isAuthed) return <Navigate to="/login" replace />;
  return children;
}

function About() { return <Page title="About"><Text>Greenify helps you track daily habits that impact the environment.</Text></Page>; }
function Contact() { return <Page title="Contact"><Text>Questions or feedback? We’d love to hear from you.</Text></Page>; }

export default function App() {
  return (
    <AuthProvider>
      <NavBar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="about" element={<About />} />
        <Route path="contact" element={<Contact />} />
        <Route path="login" element={<Login />} />
        <Route path="register" element={<Register />} />
        <Route path="account" element={<ProtectedRoute><Account /></ProtectedRoute>} />
        <Route path="*" element={<Page title="Not Found"><Text>404</Text></Page>} />
      </Routes>
    </AuthProvider>
  );
}
