import { setAccessToken } from "./services/apiFetch";
import { useEffect, useState, type FormEvent } from "react";
import {
  Activity,
  ArrowDownRight,
  ArrowUpRight,
  Bell,
  ChevronDown,
  CircleHelp,
  Clock3,
  Laptop,
  LayoutDashboard,
  LogOut,
  Plus,
  RefreshCw,
  Search,
  Settings,
  ShieldCheck,
  Ticket as TicketIcon,
  Users,
  Wrench,
  X,
} from "lucide-react";
import {
  createTicket,
  getTickets,
  updateTicket,
  type Ticket as TicketRecord,
} from "./services/ticketService";

import {
  createAsset,
  deleteAsset,
  getAssets,
  updateAsset,
  type Asset,
  type CreateAssetInput,
} from "./services/assetService";
import {
  createEmployee,
  deleteEmployee,
  getEmployees,
  type Employee,
  type CreateEmployeeInput,
} from "./services/employeeService";
import {
  getAssetAssignmentHistory,
  type AssetAssignmentHistory,
} from "./services/assetAssignmentService";
import {
  createMaintenance,
  deleteMaintenance,
  getMaintenanceRecords,
  updateMaintenance,
  type AssetMaintenance,
  type CreateMaintenance,
} from "./services/maintenanceService";
import "./App.css";
import Login from "./components/Login";
import type { AuthUser } from "./services/authService";


type ActivityRecord = {
  id: number;
  userName: string;
  action: string;
  target: string;
  createdAt: string;
};

const initialForm = {
  title: "",
  requesterName: "",
  category: "Hardware",
  priority: "Medium",
  description: "",
};

const initialAssetForm: CreateAssetInput = {
  assetTag: "",
  name: "",
  category: "Laptop",
  manufacturer: "",
  model: "",
  assignedTo: "",
  status: "Healthy",
  purchaseDate: new Date().toISOString().slice(0, 10),
  warrantyExpiry: null,
  notes: "",
};

const initialEmployeeForm: CreateEmployeeInput = {
  employeeCode: "",
  fullName: "",
  email: "",
  department: "Engineering",
  jobTitle: "",
  status: "Active",
};

const initialMaintenanceForm: CreateMaintenance = {
  assetId: 0,
  title: "",
  description: "",
  maintenanceType: "Repair",
  status: "Scheduled",
  cost: 0,
  scheduledDate: new Date().toISOString().slice(0, 10),
  completedDate: null,
  nextServiceDate: null,
  technician: "",
};
function getWarrantyStatus(warrantyExpiry: string | null) {
  if (!warrantyExpiry) return "No warranty date";

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const expiry = new Date(`${warrantyExpiry.slice(0, 10)}T00:00:00`);
  const daysRemaining = Math.ceil(
    (expiry.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
  );

  if (daysRemaining < 0) return "Expired";
  if (daysRemaining <= 30) return "Expiring soon";
  return "Covered";
}

function App() {
  const [authSession, setAuthSession] = useState<{
    token: string;
    user: AuthUser;
  } | null>(null);

 const handleLogin = (token: string, user: AuthUser) => {
  setAccessToken(token);
  setAuthSession({ token, user });
};

 const handleLogout = () => {
  setAccessToken(null);
  setAuthSession(null);
};

  const [tickets, setTickets] = useState<TicketRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [ticketError, setTicketError] = useState("");
  const [activities, setActivities] = useState<ActivityRecord[]>([]);
  const [activityError, setActivityError] = useState("");
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState("");
  const [formData, setFormData] = useState(initialForm);
  const [assets, setAssets] = useState<Asset[]>([]);
  const [assetsLoading, setAssetsLoading] = useState(true);
  const [assetError, setAssetError] = useState("");
  const [showAssetForm, setShowAssetForm] = useState(false);
  const [assetSaving, setAssetSaving] = useState(false);
  const [assetFormError, setAssetFormError] = useState("");
  const [assetForm, setAssetForm] = useState<CreateAssetInput>(initialAssetForm);
  const [editingAsset, setEditingAsset] = useState<Asset | null>(null);
  const [historyAsset, setHistoryAsset] = useState<Asset | null>(null);
  const [assignmentHistory, setAssignmentHistory] = useState<AssetAssignmentHistory[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [historyError, setHistoryError] = useState("");
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [employeesLoading, setEmployeesLoading] = useState(true);
  const [employeeError, setEmployeeError] = useState("");
  const [showEmployeeForm, setShowEmployeeForm] = useState(false);
  const [employeeSaving, setEmployeeSaving] = useState(false);
  const [employeeFormError, setEmployeeFormError] = useState("");
  const [employeeForm, setEmployeeForm] = useState<CreateEmployeeInput>(initialEmployeeForm);
  const [maintenanceRecords, setMaintenanceRecords] = useState<AssetMaintenance[]>([]);
  const [maintenanceLoading, setMaintenanceLoading] = useState(false);
  const [maintenanceError, setMaintenanceError] = useState("");
  const [showMaintenanceForm, setShowMaintenanceForm] = useState(false);
  const [maintenanceSaving, setMaintenanceSaving] = useState(false);
  const [maintenanceFormError, setMaintenanceFormError] = useState("");
  const [maintenanceForm, setMaintenanceForm] = useState<CreateMaintenance>({ ...initialMaintenanceForm });

  async function loadTickets() {
    setLoading(true);
    setTicketError("");

    try {
      const data = await getTickets();
      setTickets(data);
    } catch (error) {
      console.error("Failed to load tickets:", error);
      setTicketError(
        "Unable to load tickets. Make sure the DeskFlow API is running."
      );
    } finally {
      setLoading(false);
    }
  }

  async function loadAssets() {
    setAssetsLoading(true);
    setAssetError("");
    try {
      const data = await getAssets();
      setAssets(data);
    } catch (error) {
      console.error("Failed to load assets:", error);
      setAssetError("Unable to load assets. Make sure the DeskFlow API is running.");
    } finally {
      setAssetsLoading(false);
    }
  }

  function handleOpenCreateAsset() {
    setEditingAsset(null);
    setAssetForm({ ...initialAssetForm });
    setAssetFormError("");
    setShowAssetForm(true);
  }

  function handleOpenEditAsset(asset: Asset) {
    setEditingAsset(asset);
    setAssetForm({
      assetTag: asset.assetTag,
      name: asset.name,
      category: asset.category,
      manufacturer: asset.manufacturer ?? "",
      model: asset.model ?? "",
      assignedTo: asset.assignedTo ?? "",
      status: asset.status,
      purchaseDate: asset.purchaseDate
        ? asset.purchaseDate.slice(0, 10)
        : new Date().toISOString().slice(0, 10),
      warrantyExpiry: asset.warrantyExpiry
        ? asset.warrantyExpiry.slice(0, 10)
        : null,
      notes: asset.notes ?? "",
    });
    setAssetFormError("");
    setShowAssetForm(true);
  }

  async function handleSaveAsset(event: FormEvent) {
    event.preventDefault();
    setAssetSaving(true);
    setAssetFormError("");

    try {
      if (editingAsset) {
        await updateAsset(editingAsset.id, {
          ...editingAsset,
          ...assetForm,
          id: editingAsset.id,
          createdAt: editingAsset.createdAt,
        });
      } else {
        await createAsset(assetForm);
      }

      setAssetForm({ ...initialAssetForm });
      setEditingAsset(null);
      setShowAssetForm(false);
      await loadAssets();
    } catch (error) {
      console.error("Failed to save asset:", error);
      setAssetFormError(
        error instanceof Error
          ? error.message
          : editingAsset
            ? "Could not update asset. Please try again."
            : "Could not create asset. Please try again."
      );
    } finally {
      setAssetSaving(false);
    }
  }

  async function handleViewAssignmentHistory(asset: Asset) {
    setHistoryAsset(asset);
    setAssignmentHistory([]);
    setHistoryError("");
    setHistoryLoading(true);

    try {
      const history = await getAssetAssignmentHistory(asset.id);
      setAssignmentHistory(history);
    } catch (error) {
      console.error("Failed to load asset assignment history:", error);
      setHistoryError(
        error instanceof Error
          ? error.message
          : "Could not load assignment history. Please try again."
      );
    } finally {
      setHistoryLoading(false);
    }
  }

  async function handleDeleteAsset(asset: Asset) {
    const confirmed = window.confirm(`Delete asset ${asset.assetTag} (${asset.name})?`);
    if (!confirmed) return;
    try {
      await deleteAsset(asset.id);
      await loadAssets();
    } catch (error) {
      console.error("Failed to delete asset:", error);
      alert(error instanceof Error ? error.message : "Could not delete asset.");
    }
  }

  async function loadMaintenanceRecords() {
    setMaintenanceLoading(true);
    setMaintenanceError("");
    try {
      const data = await getMaintenanceRecords();
      setMaintenanceRecords(data);
    } catch (error) {
      console.error("Failed to load maintenance records:", error);
      setMaintenanceError(error instanceof Error ? error.message : "Unable to load maintenance records.");
    } finally {
      setMaintenanceLoading(false);
    }
  }

  async function handleCreateMaintenance(event: FormEvent) {
    event.preventDefault();
    setMaintenanceSaving(true);
    setMaintenanceFormError("");
    try {
      await createMaintenance({
        ...maintenanceForm,
        assetId: Number(maintenanceForm.assetId),
        cost: Number(maintenanceForm.cost),
        completedDate: maintenanceForm.completedDate || null,
        nextServiceDate: maintenanceForm.nextServiceDate || null,
        technician: maintenanceForm.technician?.trim() || null,
      });
      setMaintenanceForm({ ...initialMaintenanceForm });
      setShowMaintenanceForm(false);
      await loadMaintenanceRecords();
    } catch (error) {
      console.error("Failed to create maintenance record:", error);
      setMaintenanceFormError(error instanceof Error ? error.message : "Could not save maintenance record.");
    } finally {
      setMaintenanceSaving(false);
    }
  }

  async function handleMaintenanceStatusChange(
    record: AssetMaintenance,
    newStatus: string
  ) {
    try {
      const updatedRecord: AssetMaintenance = {
        ...record,
        status: newStatus,
        completedDate:
          newStatus === "Completed"
            ? new Date().toISOString()
            : record.completedDate,
      };

      await updateMaintenance(updatedRecord);
      await loadMaintenanceRecords();
    } catch (error) {
      console.error("Failed to update maintenance status:", error);
      alert(
        error instanceof Error
          ? error.message
          : "Could not update maintenance status."
      );
    }
  }

  async function handleDeleteMaintenance(record: AssetMaintenance) {
    if (!window.confirm(`Delete maintenance record: ${record.title}?`)) return;
    try {
      await deleteMaintenance(record.id);
      await loadMaintenanceRecords();
    } catch (error) {
      alert(error instanceof Error ? error.message : "Could not delete maintenance record.");
    }
  }

  async function loadEmployees() {
    setEmployeesLoading(true);
    setEmployeeError("");
    try {
      const data = await getEmployees();
      setEmployees(data);
    } catch (error) {
      console.error("Failed to load employees:", error);
      setEmployeeError("Unable to load employees. Make sure the DeskFlow API is running.");
    } finally {
      setEmployeesLoading(false);
    }
  }

  async function handleCreateEmployee(event: FormEvent) {
    event.preventDefault();
    setEmployeeSaving(true);
    setEmployeeFormError("");
    try {
      await createEmployee(employeeForm);
      setEmployeeForm(initialEmployeeForm);
      setShowEmployeeForm(false);
      await loadEmployees();
    } catch (error) {
      console.error("Failed to create employee:", error);
      setEmployeeFormError(error instanceof Error ? error.message : "Could not create employee. Please try again.");
    } finally {
      setEmployeeSaving(false);
    }
  }

  async function handleDeleteEmployee(employee: Employee) {
    if (!window.confirm(`Delete employee ${employee.fullName}?`)) return;
    try {
      await deleteEmployee(employee.id);
      await loadEmployees();
    } catch (error) {
      console.error("Failed to delete employee:", error);
      alert(error instanceof Error ? error.message : "Could not delete employee.");
    }
  }

  async function loadActivities() {
    try {
      setActivityError("");

      const response = await fetch(
        "http://localhost:5251/api/activitylogs"
      );

      if (!response.ok) {
        throw new Error(`Request failed: ${response.status}`);
      }

      const data: ActivityRecord[] = await response.json();
      setActivities(data);
    } catch (error) {
      console.error("Failed to load activities:", error);
      setActivityError(
        "Unable to load recent activity. Check the backend API."
      );
    }
  }

  useEffect(() => {
    if (!authSession) return;

    void loadTickets();
    void loadActivities();
    void loadAssets();
    void loadEmployees();
    void loadMaintenanceRecords();
  }, [authSession]);

  async function handleCreateTicket(event: FormEvent) {
    event.preventDefault();
    setSaving(true);
    setFormError("");

    try {
      await createTicket(formData);

      setShowCreateForm(false);
      setFormData(initialForm);

      await Promise.all([loadTickets(), loadActivities()]);
    } catch (error) {
      console.error("Failed to create ticket:", error);
      setFormError("Could not create ticket. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  async function handleStatusChange(
    ticket: TicketRecord,
    newStatus: string
  ) {
    try {
      const updatedTicket = await updateTicket(ticket.id, {
        title: ticket.title,
        description: ticket.description,
        requesterName: ticket.requesterName,
        category: ticket.category,
        priority: ticket.priority,
        status: newStatus,
      });

      setTickets((currentTickets) =>
        currentTickets.map((item) =>
          item.id === updatedTicket.id ? updatedTicket : item
        )
      );

      await loadActivities();
    } catch (error) {
      console.error("Status update failed:", error);
      alert(
        error instanceof Error
          ? error.message
          : "Status update failed. Please try again."
      );
      await loadTickets();
    }
  }

  
  const openCount = tickets.filter((ticket) => {
    const status = ticket.status.toLowerCase();
    return status === "open" || status === "in progress";
  }).length;

  const resolvedCount = tickets.filter(
    (ticket) => ticket.status.toLowerCase() === "resolved"
  ).length;

  const totalMaintenanceCost = maintenanceRecords.reduce(
    (total, record) => total + (Number(record.cost) || 0),
    0
  );

  const completedMaintenanceCount = maintenanceRecords.filter(
    (record) => record.status.toLowerCase() === "completed"
  ).length;

  const pendingMaintenanceCount = maintenanceRecords.filter(
    (record) => record.status.toLowerCase() !== "completed"
  ).length;

  const expiredWarrantyCount = assets.filter(
    (asset) => getWarrantyStatus(asset.warrantyExpiry) === "Expired"
  ).length;

  const expiringSoonCount = assets.filter(
    (asset) => getWarrantyStatus(asset.warrantyExpiry) === "Expiring soon"
  ).length;

  
const stats = [
  {
    label: "Total tickets",
    value: tickets.length,
    change: "Live database",
    up: true,
    icon: TicketIcon,
    color: "blue",
  },
  {
    label: "Open tickets",
    value: openCount,
    change: "Live database",
    up: false,
    icon: Clock3,
    color: "violet",
  },
  {
    label: "Resolved tickets",
    value: resolvedCount,
    change: "Live database",
    up: true,
    icon: ShieldCheck,
    color: "green",
  },
  {
    label: "Managed assets",
    value: assets.length,
    change: "Live database",
    up: true,
    icon: Laptop,
    color: "amber",
  },
  {
    label: "Maintenance cost",
    value: new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(totalMaintenanceCost),
    change: `${maintenanceRecords.length} service records`,
    up: true,
    icon: Wrench,
    color: "blue",
  },
  {
    label: "Pending maintenance",
    value: pendingMaintenanceCount,
    change: "Awaiting completion",
    up: false,
    icon: Clock3,
    color: "violet",
  },
  {
    label: "Completed maintenance",
    value: completedMaintenanceCount,
    change: "Completed jobs",
    up: true,
    icon: ShieldCheck,
    color: "green",
  },
  {
    label: "Warranty alerts",
    value: expiredWarrantyCount + expiringSoonCount,
    change: `${expiredWarrantyCount} expired · ${expiringSoonCount} expiring soon`,
    up: expiredWarrantyCount === 0 && expiringSoonCount === 0,
    icon: Laptop,
    color: "amber",
  },
];


  if (!authSession) {
    return <Login onLogin={handleLogin} />;
  }

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand">
          <div className="brand-mark">
            <Wrench size={21} />
          </div>
          <div>
            <strong>deskflow</strong>
            <span>IT OPERATIONS</span>
          </div>
        </div>

        <div className="workspace">
          <div className="workspace-avatar">A</div>
          <div className="workspace-copy">
            <strong>Acme Workspace</strong>
            <span>Enterprise plan</span>
          </div>
          <ChevronDown size={16} />
        </div>

        <div className="nav-label">WORKSPACE</div>
        <nav className="nav-list">
          <a className="nav-item active" href="#overview">
            <LayoutDashboard size={18} /> Overview
          </a>
          <a className="nav-item" href="#tickets">
            <TicketIcon size={18} />
            Tickets
            <span className="nav-count">{tickets.length}</span>
          </a>
          <a className="nav-item" href="#assets">
            <Laptop size={18} /> Assets
          </a>
          <a className="nav-item" href="#people">
            <Users size={18} /> People
          </a>
          <a className="nav-item" href="#maintenance">
            <Wrench size={18} /> Maintenance
          </a>
        </nav>

        <div className="nav-label management-label">MANAGEMENT</div>
        <nav className="nav-list">
          <a className="nav-item" href="#activity">
            <Activity size={18} /> Activity log
          </a>
          <a className="nav-item" href="#settings">
            <Settings size={18} /> Settings
          </a>
        </nav>

        <div className="sidebar-bottom">
          <div className="help-card">
            <div className="help-icon">
              <CircleHelp size={18} />
            </div>
            <strong>Need a hand?</strong>
            <p>Visit our help center for tips and support.</p>
            <a href="#help">Visit help center ↗</a>
          </div>

          <div className="profile">
            <div className="avatar profile-avatar">
              {authSession.user.fullName
                .split(/\s+/)
                .map((part) => part[0] ?? "")
                .join("")
                .slice(0, 2)
                .toUpperCase()}
            </div>
            <div className="profile-copy">
              <strong>{authSession.user.fullName}</strong>
              <span>{authSession.user.role}</span>
            </div>
            <button
              className="icon-button"
              aria-label="Sign out"
              onClick={handleLogout}
            >
              <LogOut size={17} />
            </button>
          </div>
        </div>
      </aside>

      <main className="main-area" id="overview">
        <header className="topbar">
          <div className="breadcrumbs">
            Workspace <span>/</span> <strong>Overview</strong>
          </div>
          <div className="topbar-actions">
            <label className="search-box">
              <Search size={17} />
              <input placeholder="Search anything..." />
              <kbd>Ctrl K</kbd>
            </label>
            <button
              className="icon-button notification-button"
              aria-label="Notifications"
            >
              <Bell size={19} />
              <i />
            </button>
            <div className="avatar top-avatar">
              {authSession.user.fullName
                .split(/\s+/)
                .map((part) => part[0] ?? "")
                .join("")
                .slice(0, 2)
                .toUpperCase()}
            </div>
          </div>
        </header>

        <div className="page-content">
          <section className="welcome-row">
            <div>
              <div className="eyebrow">
                <span className="live-dot" /> IT OPERATIONS DASHBOARD
              </div>
              <h1>
                Good morning, {authSession.user.fullName.split(/\s+/)[0]} <span>✳</span>
              </h1>
              <p>
                Here&apos;s what&apos;s happening across your IT operations today.
              </p>
            </div>
            <button
              className="primary-button"
              onClick={() => {
                setFormError("");
                setShowCreateForm(true);
              }}
            >
              <Plus size={18} /> Create ticket
            </button>
          </section>
          <section className="panel employee-panel" id="people"></section>
          <section className="stats-grid">
            {stats.map((stat) => {
              const Icon = stat.icon;

              return (
                <article className="stat-card" key={stat.label}>
                  <div className="stat-top">
                    <div className={`stat-icon ${stat.color}`}>
                      <Icon size={19} />
                    </div>
                    <span
                      className={`stat-change ${
                        stat.up ? "positive" : "negative"
                      }`}
                    >
                      {stat.up ? (
                        <ArrowUpRight size={14} />
                      ) : (
                        <ArrowDownRight size={14} />
                      )}
                      {stat.change}
                    </span>
                  </div>
                  <div className="stat-value">{stat.value}</div>
                  <div className="stat-label">{stat.label}</div>
                </article>
              );
            })}
          </section>

          <section className="dashboard-grid">
            <article className="panel ticket-panel" id="tickets">
              <div className="panel-header">
                <div>
                  <h2>Recent tickets</h2>
                  <p>Keep track of your team&apos;s latest requests.</p>
                </div>
                <button
                  className="text-button"
                  onClick={() => void loadTickets()}
                >
                  <RefreshCw size={14} /> Refresh
                </button>
              </div>

              <div className="table-wrap">
                <table>
                  <thead>
             <tr>
  <th>Asset</th>
  <th>Assigned to</th>
  <th>Status</th>
  <th>Warranty</th>
  <th>Action</th>
</tr>
                  </thead>
                  <tbody>
                    {loading ? (
                      <tr>
                        <td colSpan={4}>Loading tickets...</td>
                      </tr>
                    ) : ticketError ? (
                      <tr>
                        <td colSpan={4}>{ticketError}</td>
                      </tr>
                    ) : tickets.length === 0 ? (
                      <tr>
                        <td colSpan={4}>
                          No tickets yet. Create your first ticket!
                        </td>
                      </tr>
                    ) : (
                      tickets.map((ticket) => {
                        const initials = ticket.requesterName
                          .trim()
                          .split(/\s+/)
                          .map((part) => part[0] ?? "")
                          .join("")
                          .slice(0, 2)
                          .toUpperCase();

                        const priority = ticket.priority.toLowerCase();
                        const status = ticket.status
                          .toLowerCase()
                          .replace(/\s+/g, "-");

                        return (
                          <tr key={ticket.id}>
                            <td>
                              <div className="ticket-title">
                                {ticket.title}
                              </div>
                              <div className="ticket-id">
                                {ticket.ticketNumber} · {ticket.category}
                              </div>
                            </td>
                            <td>
                              <div className="requester">
                                <span className="avatar small-avatar blue">
                                  {initials || "U"}
                                </span>
                                {ticket.requesterName}
                              </div>
                            </td>
                            <td>
                              <span className={`priority ${priority}`}>
                                <i />
                                {ticket.priority}
                              </span>
                            </td>
                            <td>
                              <select
                                className={`status status-select ${status}`}
                                value={ticket.status}
                                aria-label={`Status for ${ticket.ticketNumber}`}
                                onChange={(event) =>
                                  void handleStatusChange(
                                    ticket,
                                    event.target.value
                                  )
                                }
                              >
                                <option value="Open">Open</option>
                                <option value="In Progress">
                                  In Progress
                                </option>
                                <option value="Resolved">Resolved</option>
                              </select>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>

              <div className="panel-footer">
                {loading
                  ? "Loading tickets..."
                  : `Showing ${tickets.length} ticket${
                      tickets.length === 1 ? "" : "s"
                    }`}
                <button
                  className="text-button"
                  onClick={() => void loadTickets()}
                >
                  Refresh →
                </button>
              </div>
            </article>

            <article className="panel activity-panel" id="activity">
              <div className="panel-header">
                <div>
                  <h2>Recent activity</h2>
                  <p>Latest updates from your workspace.</p>
                </div>
                <button
                  className="icon-button"
                  aria-label="Refresh activity"
                  onClick={() => void loadActivities()}
                >
                  <RefreshCw size={16} />
                </button>
              </div>

              <div className="activity-list">
                {activityError ? (
                  <p>{activityError}</p>
                ) : activities.length === 0 ? (
                  <p>No recent activity yet.</p>
                ) : (
                  activities.map((item) => {
                    const initials = item.userName
                      .split(/\s+/)
                      .map((part) => part[0] ?? "")
                      .join("")
                      .slice(0, 2)
                      .toUpperCase();

                    return (
                      <div className="activity-item" key={item.id}>
                        <div className="avatar activity-avatar purple">
                          {initials}
                        </div>
                        <div className="activity-copy">
                          <p>
                            <strong>{item.userName}</strong>{" "}
                            {item.action}{" "}
                            <a href="#tickets">{item.target}</a>
                          </p>
                          <span>
                            {new Date(item.createdAt).toLocaleString()}
                          </span>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              <button
                className="activity-link"
                onClick={() => void loadActivities()}
              >
                Refresh activity ↗
              </button>
            </article>
          </section>

          <section className="bottom-grid">
            <article className="panel workload-panel">
              <div className="panel-header">
                <div>
                  <h2>Ticket overview</h2>
                  <p>Current distribution by status.</p>
                </div>
                <span className="period-label">
                  This week <ChevronDown size={14} />
                </span>
              </div>

             
<div className="bar-chart">
  {[
    {
      label: "Open",
      count: tickets.filter(
        (ticket) => ticket.status.toLowerCase() === "open"
      ).length,
    },
    {
      label: "In Progress",
      count: tickets.filter(
        (ticket) => ticket.status.toLowerCase() === "in progress"
      ).length,
    },
    {
      label: "Resolved",
      count: tickets.filter(
        (ticket) => ticket.status.toLowerCase() === "resolved"
      ).length,
    },
  ].map((item) => {
    const total = Math.max(tickets.length, 1);
    const percentage = (item.count / total) * 100;

    return (
      <div className="bar-group" key={item.label}>
        <div className="bars">
          <span style={{ height: `${percentage}%` }} />
          <span style={{ height: "0%" }} />
        </div>
        <span className="bar-label">{item.label}</span>
      </div>
    );
  })}
</div>

<div className="chart-legend">
  <span>
    <i className="legend-blue" />
    Live ticket counts
  </span>
</div>


              <div className="chart-legend">
                <span>
                  <i className="legend-blue" />
                  Resolved
                </span>
                <span>
                  <i className="legend-violet" />
                  Open
                </span>
              </div>
            </article>

           <section className="panel employee-panel" id="people">
            
<section className="stats-grid">
  <article className="stat-card">
    <div className="stat-top">
      <div className="stat-icon amber">
        <Clock3 size={19} />
      </div>
      <span className="stat-change negative">Action needed</span>
    </div>
    <div className="stat-value">{expiringSoonCount}</div>
    <div className="stat-label">Warranties expiring in 30 days</div>
  </article>

  <article className="stat-card">
    <div className="stat-top">
      <div className="stat-icon violet">
        <ShieldCheck size={19} />
      </div>
      <span className="stat-change negative">Expired</span>
    </div>
    <div className="stat-value">{expiredWarrantyCount}</div>
    <div className="stat-label">Expired warranties</div>
  </article>
</section>

              <div className="panel-header">
                <div>
                  <h2>Asset inventory</h2>
                  <p>{assets.length} device{assets.length === 1 ? "" : "s"} stored in your workspace.</p>
                </div>
                <button
                  className="primary-button"
                  onClick={handleOpenCreateAsset}
                >
                  <Plus size={16} /> Add asset
                </button>
              </div>

              <div className="asset-summary">
                <div className="asset-number">
                  {assets.length} <span>total assets</span>
                </div>
                <span className="asset-healthy">
                  {assets.filter((asset) => asset.status.toLowerCase() === "healthy").length} healthy
                </span>
              </div>

              <div className="health-rows">
                <div>
                  <span className="health-dot healthy" />
                  Healthy devices <strong>{assets.filter((asset) => asset.status.toLowerCase() === "healthy").length}</strong>
                </div>
                <div>
                  <span className="health-dot maintenance" />
                  Needs attention <strong>{assets.filter((asset) => ["maintenance", "needs attention", "repair"].includes(asset.status.toLowerCase())).length}</strong>
                </div>
                <div>
                  <span className="health-dot retired" />
                  Retired <strong>{assets.filter((asset) => asset.status.toLowerCase() === "retired").length}</strong>
                </div>
              </div>

              {assetsLoading ? (
                <p>Loading assets...</p>
              ) : assetError ? (
                <p role="alert">{assetError}</p>
              ) : assets.length === 0 ? (
                <p>No assets yet. Add your first device to begin tracking inventory.</p>
              ) : (
                <div className="table-wrap">
                  <table>
                    <thead>
                      <tr><th>Asset</th><th>Assigned to</th><th>Status</th><th>Action</th></tr>
                    </thead>
                    <tbody>
                      {assets.map((asset) => (
                        <tr key={asset.id}>
                          <td>
                            <div className="ticket-title">{asset.name}</div>
                            <div className="ticket-id">{asset.assetTag} · {asset.category}</div>
                          </td>
                          <td>{asset.assignedTo || "Unassigned"}</td>
                          <td>
  <span
    className={`priority ${
      getWarrantyStatus(asset.warrantyExpiry) === "Expired"
        ? "high"
        : getWarrantyStatus(asset.warrantyExpiry) === "Expiring soon"
          ? "medium"
          : "low"
    }`}
  >
    <i />
    {getWarrantyStatus(asset.warrantyExpiry)}
  </span>
</td>
                          <td><span className={`priority ${asset.status.toLowerCase() === "healthy" ? "low" : "high"}`}><i />{asset.status}</span></td>
                          <td>
                            <button className="text-button" onClick={() => handleOpenEditAsset(asset)}>Edit</button>{" "}
                            <button className="text-button" onClick={() => void handleViewAssignmentHistory(asset)}>History</button>{" "}
                            <button className="text-button" onClick={() => void handleDeleteAsset(asset)}>Delete</button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              <button className="text-button asset-link" onClick={() => void loadAssets()}>
                <RefreshCw size={14} /> Refresh assets
              </button>
           </section>
          </section>

          <section className="panel employee-panel" id="people">
            <div className="panel-header">
              <div>
                <h2>Employee directory</h2>
                <p>{employees.length} employee{employees.length === 1 ? "" : "s"} registered in your workspace.</p>
              </div>
              <button
                className="primary-button"
                onClick={() => {
                  setEmployeeFormError("");
                  setShowEmployeeForm(true);
                }}
              >
                <Plus size={16} /> Add employee
              </button>
            </div>

            <div className="asset-summary">
              <div className="asset-number">
                {employees.length} <span>total employees</span>
              </div>
              <span className="asset-healthy">
                {employees.filter((employee) => employee.status.toLowerCase() === "active").length} active
              </span>
            </div>

            {employeesLoading ? (
              <p>Loading employees...</p>
            ) : employeeError ? (
              <p role="alert">{employeeError}</p>
            ) : employees.length === 0 ? (
              <p>No employees yet. Add your first employee to begin managing assignments.</p>
            ) : (
              <div className="table-wrap">
                <table>
                  <thead>
                    <tr>
                      <th>Employee</th>
                      <th>Department</th>
                      <th>Job title</th>
                      <th>Status</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {employees.map((employee) => (
                      <tr key={employee.id}>
                        <td>
                          <div className="requester">
                            <span className="avatar small-avatar blue">
                              {employee.fullName.split(/\\s+/).map((part) => part[0] ?? "").join("").slice(0, 2).toUpperCase()}
                            </span>
                            <div>
                              <div className="ticket-title">{employee.fullName}</div>
                              <div className="ticket-id">{employee.employeeCode} · {employee.email}</div>
                            </div>
                          </div>
                        </td>
                        <td>{employee.department || "—"}</td>
                        <td>{employee.jobTitle || "—"}</td>
                        <td>
                          <span className={`priority ${employee.status.toLowerCase() === "active" ? "low" : "high"}`}>
                            <i />{employee.status}
                          </span>
                        </td>
                        <td>
                          <button className="text-button" onClick={() => void handleDeleteEmployee(employee)}>
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
            <button className="text-button asset-link" onClick={() => void loadEmployees()}>
              <RefreshCw size={14} /> Refresh employees
            </button>
          </section>

          <section className="panel employee-panel" id="maintenance">
            <div className="panel-header">
              <div>
                <h2>Maintenance management</h2>
                <p>Schedule repairs, track service costs, and review maintenance history.</p>
              </div>
              <button className="primary-button" onClick={() => { setMaintenanceFormError(""); setMaintenanceForm({ ...initialMaintenanceForm, assetId: assets[0]?.id ?? 0 }); setShowMaintenanceForm(true); }}>
                <Plus size={16} /> Record maintenance
              </button>
            </div>
            {maintenanceError && <p role="alert">{maintenanceError}</p>}
            {maintenanceLoading ? (
              <p>Loading maintenance records...</p>
            ) : maintenanceRecords.length === 0 ? (
              <p>No maintenance records yet. Select “Record maintenance” to log the first repair or service.</p>
            ) : (
              <div className="table-wrap">
                <table>
                  <thead><tr><th>Maintenance</th><th>Asset</th><th>Type</th><th>Status</th><th>Scheduled</th><th>Cost</th><th>Technician</th><th>Action</th></tr></thead>
                  <tbody>
                    {maintenanceRecords.map((record) => {
                      const asset = assets.find((item) => item.id === record.assetId);
                      return <tr key={record.id}>
                        <td><div className="ticket-title">{record.title}</div><div className="ticket-id">{record.description || "No description"}</div></td>
                        <td>{asset ? `${asset.name} (${asset.assetTag})` : `Asset #${record.assetId}`}</td>
                        <td>{record.maintenanceType}</td>
                        <td>
                          <select
                            className={`status status-select ${record.status.toLowerCase().replace(/\s+/g, "-")}`}
                            value={record.status}
                            aria-label={`Maintenance status for ${record.title}`}
                            onChange={(event) =>
                              void handleMaintenanceStatusChange(record, event.target.value)
                            }
                          >
                            <option value="Scheduled">Scheduled</option>
                            <option value="In Progress">In Progress</option>
                            <option value="Completed">Completed</option>
                          </select>
                        </td>
                        <td>{record.scheduledDate ? new Date(record.scheduledDate).toLocaleDateString() : "—"}</td>
                        <td>{new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 2 }).format(record.cost)}</td>
                        <td>{record.technician || "—"}</td>
                        <td><button className="text-button" onClick={() => void handleDeleteMaintenance(record)}>Delete</button></td>
                      </tr>;
                    })}
                  </tbody>
                </table>
              </div>
            )}
            <button className="text-button asset-link" onClick={() => void loadMaintenanceRecords()}><RefreshCw size={14} /> Refresh maintenance</button>
          </section>

          <footer className="footer">
            <span>© 2026 DeskFlow Technologies</span>
            <span>
              <i className="live-dot" /> All systems operational
            </span>
            <span>Made for better IT operations</span>
          </footer>
        </div>
      </main>

      {showCreateForm && (
        <div
          className="ticket-modal-backdrop"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget && !saving) {
              setShowCreateForm(false);
            }
          }}
        >
          <section
            className="ticket-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="create-ticket-title"
          >
            <div className="ticket-modal-header">
              <div>
                <h2 id="create-ticket-title">Create a ticket</h2>
                <p>Tell us what support you need.</p>
              </div>
              <button
                className="icon-button"
                type="button"
                aria-label="Close form"
                disabled={saving}
                onClick={() => setShowCreateForm(false)}
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCreateTicket}>
              <label>
                Ticket title
                <input
                  required
                  maxLength={150}
                  value={formData.title}
                  onChange={(event) =>
                    setFormData({
                      ...formData,
                      title: event.target.value,
                    })
                  }
                  placeholder="e.g. Laptop won't connect to Wi-Fi"
                />
              </label>

              <label>
                Requester name
                <input
                  required
                  maxLength={100}
                  value={formData.requesterName}
                  onChange={(event) =>
                    setFormData({
                      ...formData,
                      requesterName: event.target.value,
                    })
                  }
                  placeholder="Enter the requester's name"
                />
              </label>

              <div className="ticket-form-row">
                <label>
                  Category
                  <select
                    value={formData.category}
                    onChange={(event) =>
                      setFormData({
                        ...formData,
                        category: event.target.value,
                      })
                    }
                  >
                    <option>Hardware</option>
                    <option>Network</option>
                    <option>Software</option>
                    <option>Access</option>
                    <option>Security</option>
                    <option>Other</option>
                  </select>
                </label>

                <label>
                  Priority
                  <select
                    value={formData.priority}
                    onChange={(event) =>
                      setFormData({
                        ...formData,
                        priority: event.target.value,
                      })
                    }
                  >
                    <option>Low</option>
                    <option>Medium</option>
                    <option>High</option>
                  </select>
                </label>
              </div>

              <label>
                Description
                <textarea
                  rows={4}
                  maxLength={2000}
                  value={formData.description}
                  onChange={(event) =>
                    setFormData({
                      ...formData,
                      description: event.target.value,
                    })
                  }
                  placeholder="Describe the issue and relevant details..."
                />
              </label>

              {formError && (
                <p className="ticket-form-error" role="alert">
                  {formError}
                </p>
              )}

              <div className="ticket-modal-actions">
                <button
                  type="button"
                  className="text-button"
                  disabled={saving}
                  onClick={() => setShowCreateForm(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="primary-button"
                  disabled={saving}
                >
                  {saving ? "Creating..." : "Create ticket"}
                </button>
              </div>
            </form>
          </section>
        </div>
      )}

      {showEmployeeForm && (
        <div
          className="ticket-modal-backdrop"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget && !employeeSaving) {
              setShowEmployeeForm(false);
            }
          }}
        >
          <section className="ticket-modal" role="dialog" aria-modal="true" aria-labelledby="create-employee-title">
            <div className="ticket-modal-header">
              <div>
                <h2 id="create-employee-title">Add an employee</h2>
                <p>Register a member of your workspace.</p>
              </div>
              <button
                className="icon-button"
                type="button"
                aria-label="Close form"
                disabled={employeeSaving}
                onClick={() => setShowEmployeeForm(false)}
              >
                <X size={18} />
              </button>
            </div>
            <form onSubmit={handleCreateEmployee}>
              <label>
                Employee code
                <input required maxLength={30} value={employeeForm.employeeCode} onChange={(event) => setEmployeeForm({ ...employeeForm, employeeCode: event.target.value })} placeholder="e.g. EMP-001" />
              </label>
              <label>
                Full name
                <input required maxLength={100} value={employeeForm.fullName} onChange={(event) => setEmployeeForm({ ...employeeForm, fullName: event.target.value })} placeholder="Enter full name" />
              </label>
              <label>
                Email
                <input required type="email" maxLength={150} value={employeeForm.email} onChange={(event) => setEmployeeForm({ ...employeeForm, email: event.target.value })} placeholder="name@company.com" />
              </label>
              <div className="ticket-form-row">
                <label>
                  Department
                  <select value={employeeForm.department} onChange={(event) => setEmployeeForm({ ...employeeForm, department: event.target.value })}>
                    <option>Engineering</option><option>IT Support</option><option>Human Resources</option><option>Finance</option><option>Operations</option><option>Marketing</option><option>Sales</option><option>Other</option>
                  </select>
                </label>
                <label>
                  Status
                  <select value={employeeForm.status} onChange={(event) => setEmployeeForm({ ...employeeForm, status: event.target.value })}>
                    <option>Active</option><option>Inactive</option>
                  </select>
                </label>
              </div>
              <label>
                Job title
                <input maxLength={100} value={employeeForm.jobTitle} onChange={(event) => setEmployeeForm({ ...employeeForm, jobTitle: event.target.value })} placeholder="e.g. Software Engineer" />
              </label>
              {employeeFormError && <p className="ticket-form-error" role="alert">{employeeFormError}</p>}
              <div className="ticket-modal-actions">
                <button type="button" className="text-button" disabled={employeeSaving} onClick={() => setShowEmployeeForm(false)}>Cancel</button>
                <button type="submit" className="primary-button" disabled={employeeSaving}>{employeeSaving ? "Saving..." : "Save employee"}</button>
              </div>
            </form>
          </section>
        </div>
      )}

      {historyAsset && (
        <div
          className="ticket-modal-backdrop"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget && !historyLoading) {
              setHistoryAsset(null);
            }
          }}
        >
          <section
            className="ticket-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="assignment-history-title"
          >
            <div className="ticket-modal-header">
              <div>
                <h2 id="assignment-history-title">Assignment history</h2>
                <p>{historyAsset.name} · {historyAsset.assetTag}</p>
              </div>
              <button
                className="icon-button"
                type="button"
                aria-label="Close assignment history"
                onClick={() => setHistoryAsset(null)}
              >
                <X size={18} />
              </button>
            </div>

            {historyLoading ? (
              <p>Loading assignment history...</p>
            ) : historyError ? (
              <p className="ticket-form-error" role="alert">{historyError}</p>
            ) : assignmentHistory.length === 0 ? (
              <p>No assignment changes have been recorded for this asset yet.</p>
            ) : (
              <div className="table-wrap">
                <table>
                  <thead>
                    <tr>
                      <th>Previous assignee</th>
                      <th>New assignee</th>
                      <th>Date changed</th>
                    </tr>
                  </thead>
                  <tbody>
                    {assignmentHistory.map((record) => (
                      <tr key={record.id}>
                        <td>{record.previousAssignee || "Unassigned"}</td>
                        <td>{record.newAssignee || "Unassigned"}</td>
                        <td>{new Date(record.changedAt).toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            <div className="ticket-modal-actions">
              <button
                type="button"
                className="text-button"
                onClick={() => setHistoryAsset(null)}
              >
                Close
              </button>
              <button
                type="button"
                className="primary-button"
                disabled={historyLoading}
                onClick={() => void handleViewAssignmentHistory(historyAsset)}
              >
                <RefreshCw size={14} /> Refresh history
              </button>
            </div>
          </section>
        </div>
      )}

      {showMaintenanceForm && (
        <div className="ticket-modal-backdrop" onMouseDown={(event) => { if (event.target === event.currentTarget && !maintenanceSaving) setShowMaintenanceForm(false); }}>
          <section className="ticket-modal" role="dialog" aria-modal="true" aria-labelledby="maintenance-form-title">
            <div className="ticket-modal-header">
              <div><h2 id="maintenance-form-title">Record maintenance</h2><p>Log a repair, inspection, or preventive service.</p></div>
              <button className="icon-button" type="button" aria-label="Close form" disabled={maintenanceSaving} onClick={() => setShowMaintenanceForm(false)}><X size={18} /></button>
            </div>
            <form onSubmit={handleCreateMaintenance}>
              <label>Asset<select required value={maintenanceForm.assetId || ""} onChange={(event) => setMaintenanceForm({ ...maintenanceForm, assetId: Number(event.target.value) })}><option value="" disabled>Select an asset</option>{assets.map((asset) => <option key={asset.id} value={asset.id}>{asset.name} ({asset.assetTag})</option>)}</select></label>
              <label>Task title<input required maxLength={150} value={maintenanceForm.title} onChange={(event) => setMaintenanceForm({ ...maintenanceForm, title: event.target.value })} placeholder="e.g. Replace laptop battery" /></label>
              <label>Description<textarea rows={3} maxLength={2000} value={maintenanceForm.description} onChange={(event) => setMaintenanceForm({ ...maintenanceForm, description: event.target.value })} placeholder="Describe the repair or service" /></label>
              <div className="ticket-form-row">
                <label>Type<select value={maintenanceForm.maintenanceType} onChange={(event) => setMaintenanceForm({ ...maintenanceForm, maintenanceType: event.target.value })}><option>Repair</option><option>Preventive</option><option>Inspection</option><option>Upgrade</option><option>Other</option></select></label>
                <label>Status<select value={maintenanceForm.status} onChange={(event) => setMaintenanceForm({ ...maintenanceForm, status: event.target.value })}><option>Scheduled</option><option>In Progress</option><option>Completed</option></select></label>
              </div>
              <div className="ticket-form-row">
                <label>Scheduled date<input required type="date" value={maintenanceForm.scheduledDate.slice(0, 10)} onChange={(event) => setMaintenanceForm({ ...maintenanceForm, scheduledDate: event.target.value })} /></label>
                <label>Cost (₹)<input type="number" min="0" step="0.01" value={maintenanceForm.cost} onChange={(event) => setMaintenanceForm({ ...maintenanceForm, cost: Number(event.target.value) })} /></label>
              </div>
              <div className="ticket-form-row">
                <label>Completed date<input type="date" value={maintenanceForm.completedDate?.slice(0, 10) ?? ""} onChange={(event) => setMaintenanceForm({ ...maintenanceForm, completedDate: event.target.value || null })} /></label>
                <label>Next service date<input type="date" value={maintenanceForm.nextServiceDate?.slice(0, 10) ?? ""} onChange={(event) => setMaintenanceForm({ ...maintenanceForm, nextServiceDate: event.target.value || null })} /></label>
              </div>
              <label>Technician<input maxLength={100} value={maintenanceForm.technician ?? ""} onChange={(event) => setMaintenanceForm({ ...maintenanceForm, technician: event.target.value })} placeholder="Technician or service provider" /></label>
              {maintenanceFormError && <p className="ticket-form-error" role="alert">{maintenanceFormError}</p>}
              {assets.length === 0 && <p className="ticket-form-error" role="alert">Add an asset before recording maintenance.</p>}
              <div className="ticket-modal-actions"><button type="button" className="text-button" disabled={maintenanceSaving} onClick={() => setShowMaintenanceForm(false)}>Cancel</button><button type="submit" className="primary-button" disabled={maintenanceSaving || assets.length === 0}>{maintenanceSaving ? "Saving..." : "Save record"}</button></div>
            </form>
          </section>
        </div>
      )}

      {showAssetForm && (
        <div
          className="ticket-modal-backdrop"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget && !assetSaving) {
              setShowAssetForm(false);
              setEditingAsset(null);
            }
          }}
        >
          <section className="ticket-modal" role="dialog" aria-modal="true" aria-labelledby="create-asset-title">
            <div className="ticket-modal-header">
              <div>
                <h2 id="create-asset-title">{editingAsset ? "Edit asset" : "Add an asset"}</h2>
                <p>{editingAsset ? "Update device details or change its assignee." : "Register a device in your IT inventory."}</p>
              </div>
              <button className="icon-button" type="button" aria-label="Close form" disabled={assetSaving} onClick={() => { setShowAssetForm(false); setEditingAsset(null); }}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveAsset}>
              <label>
                Asset tag
                <input required maxLength={30} value={assetForm.assetTag} onChange={(event) => setAssetForm({ ...assetForm, assetTag: event.target.value })} placeholder="e.g. LAP-001" />
              </label>
              <label>
                Device name
                <input required maxLength={100} value={assetForm.name} onChange={(event) => setAssetForm({ ...assetForm, name: event.target.value })} placeholder="e.g. Finance laptop" />
              </label>
              <div className="ticket-form-row">
                <label>
                  Category
                  <select value={assetForm.category} onChange={(event) => setAssetForm({ ...assetForm, category: event.target.value })}>
                    <option>Laptop</option><option>Desktop</option><option>Monitor</option><option>Printer</option><option>Mobile</option><option>Network</option><option>Other</option>
                  </select>
                </label>
                <label>
                  Status
                  <select value={assetForm.status} onChange={(event) => setAssetForm({ ...assetForm, status: event.target.value })}>
                    <option>Healthy</option><option>Maintenance</option><option>Needs attention</option><option>Retired</option>
                  </select>
                </label>
              </div>
              <div className="ticket-form-row">
                <label>
                  Manufacturer
                  <input maxLength={100} value={assetForm.manufacturer} onChange={(event) => setAssetForm({ ...assetForm, manufacturer: event.target.value })} placeholder="e.g. Dell" />
                </label>
                <label>
                  Model
                  <input maxLength={100} value={assetForm.model} onChange={(event) => setAssetForm({ ...assetForm, model: event.target.value })} placeholder="e.g. Latitude 5440" />
                </label>
              </div>
              <label>
                Assigned to
                <select
                  value={assetForm.assignedTo}
                  onChange={(event) =>
                    setAssetForm({ ...assetForm, assignedTo: event.target.value })
                  }
                >
                  <option value="">Unassigned</option>
                  {employees
                    .filter((employee) => employee.status.toLowerCase() === "active")
                    .map((employee) => (
                      <option key={employee.id} value={employee.fullName}>
                        {employee.fullName} ({employee.employeeCode})
                      </option>
                    ))}
                </select>
              </label>
              <div className="ticket-form-row">
                <label>
                  Purchase date
                  <input type="date" value={assetForm.purchaseDate} onChange={(event) => setAssetForm({ ...assetForm, purchaseDate: event.target.value })} />
                </label>
                <label>
                  Warranty expiry
                  <input type="date" value={assetForm.warrantyExpiry ?? ""} onChange={(event) => setAssetForm({ ...assetForm, warrantyExpiry: event.target.value || null })} />
                </label>
              </div>
              <label>
                Notes
                <textarea rows={3} maxLength={1000} value={assetForm.notes} onChange={(event) => setAssetForm({ ...assetForm, notes: event.target.value })} placeholder="Optional device details..." />
              </label>
              {assetFormError && <p className="ticket-form-error" role="alert">{assetFormError}</p>}
              <div className="ticket-modal-actions">
                <button type="button" className="text-button" disabled={assetSaving} onClick={() => { setShowAssetForm(false); setEditingAsset(null); }}>Cancel</button>
                <button type="submit" className="primary-button" disabled={assetSaving}>{assetSaving ? "Saving..." : editingAsset ? "Save changes" : "Save asset"}</button>
              </div>
            </form>
          </section>
        </div>
      )}
    </div>
  );
}

export default App;
