"use client"

import { useEffect, useState } from "react"
import Header from "@/components/header"
import Sidebar from "@/components/sidebar"
import Footer from "@/components/footer"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Button } from "@/components/ui/button"
import { useMasterData, type Role, type RouteKey } from "@/lib/master-data-context"
import { fetchPermissions, fetchRoles, fetchPermissionsByRole, SavePermissionsByRole } from "@/repositories/masters-repo"

export default function PermissionMappingPage() {
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false)
  const { rolePermissions, setRolePermissions } = useMasterData()
  const [role, setRole] = useState<string>("")
  const [selected, setSelected] = useState<string[]>([]) // Store PermissionIds
  const [user, setUser] = useState<any>(null)
  const [rolesData, setRolesData] = useState<any[]>([])
  const [permissionsData, setPermissionsData] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [allPermissions, setAllPermissions] = useState<any[]>([])

  useEffect(() => {
    const userData = localStorage.getItem("cft_user")
    if (userData) setUser(JSON.parse(userData))
  }, [])

  const fetchRolesData = async () => {
    try {
      setLoading(true)
      const rolesResponse = await fetchRoles()
      console.log(`rolesData`, rolesResponse)

      if (rolesResponse?.data?.length > 0) {
        const formattedData = rolesResponse.data.map((x: any) => x.data) ?? []
        setRolesData(formattedData)
        
        if (formattedData.length > 0 && !role) {
          const firstRoleId = formattedData[0].id
          console.log(`Setting default role ID:`, firstRoleId)
          setRole(firstRoleId)
        }
      } else {
        setRolesData([])
      }
    } catch (error) {
      console.error("Error while fetching roles:", error)
      alert("Error while fetching roles")
      setRolesData([])
    }
  }

  const fetchAllPermissionsData = async () => {
    try {
      const permissionsResponse = await fetchPermissions()
      console.log(`allPermissionsData`, permissionsResponse)

      if (permissionsResponse?.data?.length > 0) {
        const formattedData = permissionsResponse.data.map((x: any) => x.data) ?? []
        setAllPermissions(formattedData)
      } else {
        setAllPermissions([])
      }
    } catch (error) {
      console.error("Error while fetching all permissions:", error)
      alert("Error while fetching all permissions")
      setAllPermissions([])
    }
  }

  const fetchPermissionsByRoleData = async (payload: { roleId: string }) => {
    try {
      setLoading(true)
    
      const permissionsResponse = await fetchPermissionsByRole(payload)
      console.log(`permissionsByRoleData for role ${payload.roleId}:`, permissionsResponse)

      if (permissionsResponse?.data?.length > 0) {
        const formattedData = permissionsResponse.data.map((x: any) => x.data) ?? []
        setPermissionsData(formattedData)
        
        // Extract PermissionIds from the API response
        const selectedPermissionIds = formattedData
          .map(mapping => mapping.PermissionId || mapping.permissionId) // Handle both cases
          .filter(Boolean)
          .map(id => id.toString()) // Ensure they are strings for comparison
        
        console.log(`Setting selected permission IDs:`, selectedPermissionIds)
        setSelected(selectedPermissionIds)
      } else {
        setPermissionsData([])
        setSelected([])
      }
    } catch (error) {
      console.error("Error while fetching permissions by role:", error)
      alert("Error while fetching permissions")
      setPermissionsData([])
      setSelected([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchRolesData()
    fetchAllPermissionsData()
  }, [])

  useEffect(() => {
    if (role) {
      console.log(`Fetching permissions for role:`, role)
      const payload = { roleId: role }
      fetchPermissionsByRoleData(payload)
    }
  }, [role])

  const handleRoleChange = (roleId: string) => {
    console.log(`Role changed to:`, roleId)
    setRole(roleId)
  }

  const toggle = (permissionId: string) =>
    setSelected((prev) => 
      prev.includes(permissionId) 
        ? prev.filter((id) => id !== permissionId) 
        : [...prev, permissionId]
    )

  const save = async () => {
    if (!role) {
      alert("Please select a role first")
      return
    }

    try {
      const payload = {
        roleId: role, 
        permissionIds: selected.join(',')
      }

      console.log('Saving payload:', payload)
  
      // Call the API to save permissions
      await SavePermissionsByRole(payload)
      
      // Reload the data to reflect changes
      await fetchRolesData()
      await fetchAllPermissionsData()
      
      // If you want to reload the current role's permissions as well
      if (role) {
        const payload = { roleId: role }
        await fetchPermissionsByRoleData(payload)
      }
      
      alert("Permissions updated successfully")
    } catch (error) {
      console.error("Error saving permissions:", error)
      alert("Error updating permissions")
    }
  }

  // Create route options from all available permissions data with proper mapping
  const routeOptions = allPermissions.map(permission => {
    console.log('Processing permission:', permission);
    
    // Use the correct ID field - try different possible field names
    const permissionId = permission.permissionId || permission.id || permission.PermissionId;
    const permissionKey = permission.key || permission.name || permission.Key;
    
    // Define the label mappings
    const labelMappings: { [key: string]: string } = {
      'Complaints': 'View Complaints',
      'Customers': 'Customer Master',
      'Engineers': 'Engineer Master',
      'Users': 'User Master',
      'RoleMapping': 'User Role Mapping',
      'PermissionMapping': 'Role Permission Mapping',
      'registercomplaint': 'Register Complaint',
      'Dashboard': 'Dashboard',
      'Profile': 'Profile'
    };

    // Get the label from mappings or use the original name
    const label = labelMappings[permissionKey] || permission.name || permission.label || permission.description || permissionKey;

    // Create a unique key by combining id and key to ensure uniqueness
    const uniqueKey = `${permissionId}-${permissionKey}`;

    return {
      id: permissionId.toString(), // Ensure ID is string to match selected array
      key: permissionKey as RouteKey,
      label: label,
      uniqueKey: uniqueKey
    };
  });

  // Get current role name for display
  const getCurrentRoleName = () => {
    const currentRole = rolesData.find(roleItem => roleItem.id === role)
    return currentRole?.name || currentRole?.roleName || role || "Select Role"
  }

  console.log(`Current role ID:`, role)
  console.log(`Roles data:`, rolesData)
  console.log(`Selected permission IDs:`, selected)
  console.log(`All permissions:`, allPermissions)
  console.log(`Route options:`, routeOptions)
  console.log(`Permissions data from API:`, permissionsData)

  // Debug: Check if IDs match
  console.log(`Debug - Checking ID matching:`);
  routeOptions.forEach(option => {
    console.log(`Permission ${option.label}: ID=${option.id}, Selected=${selected.includes(option.id)}`);
  });

  if (loading) {
    return (
      <div className="flex h-screen bg-slate-50">
        <Sidebar isMobileOpen={isMobileSidebarOpen} onClose={() => setIsMobileSidebarOpen(false)} />
        <div className="flex-1 flex flex-col lg:ml-[60px] mt-[60px]">
          <Header user={user} onMenuClick={() => setIsMobileSidebarOpen(true)} />
          <main className="flex-1 overflow-auto p-4 md:p-8">
            <Card className="shadow-lg">
              <CardContent className="flex justify-center items-center h-32">
                <div className="text-lg">Loading permissions...</div>
              </CardContent>
            </Card>
          </main>
          <Footer />
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-screen bg-slate-50">
      <Sidebar isMobileOpen={isMobileSidebarOpen} onClose={() => setIsMobileSidebarOpen(false)} />
      <div className="flex-1 flex flex-col lg:ml-[60px] mt-[60px]">
        <Header user={user} onMenuClick={() => setIsMobileSidebarOpen(true)} />
        <main className="flex-1 overflow-auto p-4 md:p-8">
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="text-xl md:text-2xl font-bold">Role Permission Mapping</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Role Selection Buttons */}
              <div className="flex gap-4 flex-wrap">
                {rolesData.map((roleItem) => {
                  const roleId = roleItem.id
                  const roleName = roleItem.name || roleItem.roleName || roleItem.id
                  const isSelected = role === roleId
                  
                  return (
                    <Button
                      key={roleId}
                      variant={isSelected ? "default" : "outline"}
                      onClick={() => handleRoleChange(roleId)}
                    >
                      {roleName}
                    </Button>
                  )
                })}
              </div>

              {role && (
                <>
                  <div className="p-3 bg-blue-50 rounded-md">
                    <p className="text-blue-800 font-medium">
                      Managing permissions for: <span className="font-bold">{getCurrentRoleName()}</span>
                    </p>
                  </div>

                  {/* Permissions Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {routeOptions.map((permission) => (
                      <label 
                        key={permission.uniqueKey}
                        className="flex items-center gap-3 border rounded-md p-3"
                      >
                        <Checkbox 
                          checked={selected.includes(permission.id)}
                          onCheckedChange={() => toggle(permission.id)}
                        />
                        <span>{permission.label}</span>
                      </label>
                    ))}
                  </div>

                  {routeOptions.length === 0 && (
                    <div className="text-center text-gray-500 py-8">
                      No permissions found
                    </div>
                  )}

                  <Button onClick={save} className="bg-gradient-to-r from-blue-500 to-cyan-400">
                    Save Permissions for {getCurrentRoleName()}
                  </Button>
                </>
              )}

              {!role && rolesData.length > 0 && (
                <div className="text-center text-gray-500 py-8">
                  Please select a role to view and manage permissions
                </div>
              )}
            </CardContent>
          </Card>
        </main>
        <Footer />
      </div>
    </div>
  )
}