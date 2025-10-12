export const defaults = {
  auth: {
    login: { success: false, message: "Auth service unavailable", data: null },
    register: { success: false, message: "Registration unavailable", data: null },
  },
  masters: {
    users: {
      success: true,
      data: [
        { userId: 1, name: "Admin User", emailId: "admin@cft.com", mobileNumber: "9999999999", address: "HQ" },
        {
          userId: 2,
          name: "Service Engineer",
          emailId: "eng1@cft.com",
          mobileNumber: "8888888888",
          address: "Field Office",
        },
        { userId: 3, name: "CSR Agent", emailId: "csr@cft.com", mobileNumber: "7777777777", address: "Contact Center" },
      ],
    },
    roles: {
      success: true,
      data: [
        { roleId: 1, roleName: "Admin" },
        { roleId: 2, roleName: "Engineer" },
        { roleId: 3, roleName: "CSR" },
      ],
    },
    permissions: {
      success: true,
      data: [
        { key: "VIEW_DASHBOARD", name: "View Dashboard" },
        { key: "VIEW_COMPLAINTS", name: "View Complaints" },
        { key: "ASSIGN_COMPLAINTS", name: "Assign Complaints" },
        { key: "MANAGE_MASTERS", name: "Manage Masters" },
      ],
    },
    userRoles: {
      success: true,
      data: [
        { userId: 1, roleId: 1 },
        { userId: 2, roleId: 2 },
        { userId: 3, roleId: 3 },
      ],
    },
    rolePermissions: {
      success: true,
      data: [
        // Admin - all
        { roleId: 1, permissionKey: "VIEW_DASHBOARD" },
        { roleId: 1, permissionKey: "VIEW_COMPLAINTS" },
        { roleId: 1, permissionKey: "ASSIGN_COMPLAINTS" },
        { roleId: 1, permissionKey: "MANAGE_MASTERS" },
        // Engineer - view complaints
        { roleId: 2, permissionKey: "VIEW_DASHBOARD" },
        { roleId: 2, permissionKey: "VIEW_COMPLAINTS" },
        // CSR - dashboard + view complaints
        { roleId: 3, permissionKey: "VIEW_DASHBOARD" },
        { roleId: 3, permissionKey: "VIEW_COMPLAINTS" },
      ],
    },
    customers: {
      success: true,
      data: [
        {
          customerId: 1001,
          name: "Acme Corp",
          mobileNumber: "9123456780",
          email: "ops@acme.com",
          address: "Acme Park, Houston",
        },
        {
          customerId: 1002,
          name: "Globex Ltd",
          mobileNumber: "9234567810",
          email: "service@globex.com",
          address: "Globex Ave, Chicago",
        },
      ],
    },
    engineers: {
      success: true,
      data: [
        { engineerId: 501, name: "Alex Johnson", email: "alex@cft.com", mobileNumber: "9001002001" },
        { engineerId: 502, name: "Priya Sharma", email: "priya@cft.com", mobileNumber: "9001002002" },
      ],
    },
  },
  complaints: {
    list: {
      success: true,
      data: [
        // Keep minimal sample list; UI stays usable if backend is down
        {
          complaintId: "CFT-0001",
          customerId: 1001,
          customerName: "Acme Corp",
          mobileNumber: "9123456780",
          email: "ops@acme.com",
          address: "Acme Park, Houston",
          natureOfComplaint: "Installation",
          details: "Need assistance configuring new device.",
          assignedEngineerId: 501,
          status: "Open",
          createdAt: new Date().toISOString(),
        },
      ],
    },
    create: { success: false, message: "Complaint service unavailable", data: null },
    assign: { success: false, message: "Assignment service unavailable" },
  },
}

export const demo = {
  auth: {
    credentials: { emailId: "admin@cft.com", password: "Password@123" },
    user: {
      userId: 1,
      name: "Admin User",
      emailId: "admin@cft.com",
      roles: ["Admin"],
      permissions: ["VIEW_DASHBOARD", "VIEW_COMPLAINTS", "ASSIGN_COMPLAINTS", "MANAGE_MASTERS"],
      token: "demo-token",
    },
  },
}
