"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { UserForm } from "@/components/user-form"
import { UserList } from "@/components/user-list"
import { Plus, Search, Users, Database, Activity } from "lucide-react"
import type { UserFormData } from "@/lib/validations"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"

interface User {
  id: number
  name: string
  email: string
  phone?: string
  role: string
  createdAt: string
  updatedAt: string
}

export default function Dashboard() {
  const [users, setUsers] = useState<User[]>([])
  const [filteredUsers, setFilteredUsers] = useState<User[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [showForm, setShowForm] = useState(false)
  const [editingUser, setEditingUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isFormLoading, setIsFormLoading] = useState(false)
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [isUserDialogOpen, setIsUserDialogOpen] = useState(false)

  useEffect(() => {
    fetchUsers()
  }, [])

  useEffect(() => {
    const filtered = users.filter(
      (user) =>
        user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.role.toLowerCase().includes(searchTerm.toLowerCase()),
    )
    setFilteredUsers(filtered)
  }, [users, searchTerm])

  const fetchUsers = async () => {
    setIsLoading(true)
    try {
      const response = await fetch("/api/users")
      if (response.ok) {
        const data = await response.json()
        setUsers(data)
      }
    } catch (error) {
      console.error("Failed to fetch users:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleCreateUser = async (data: UserFormData) => {
    setIsFormLoading(true)
    try {
      const response = await fetch("/api/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })

      if (response.ok) {
        await fetchUsers()
        setShowForm(false)
      } else {
        const error = await response.json()
        throw new Error(error.error)
      }
    } catch (error) {
      throw error
    } finally {
      setIsFormLoading(false)
    }
  }

  const handleUpdateUser = async (data: UserFormData) => {
    if (!editingUser) return

    setIsFormLoading(true)
    try {
      const response = await fetch(`/api/users/${editingUser.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })

      if (response.ok) {
        await fetchUsers()
        setEditingUser(null)
        setShowForm(false)
      } else {
        const error = await response.json()
        throw new Error(error.error)
      }
    } catch (error) {
      throw error
    } finally {
      setIsFormLoading(false)
    }
  }

  const handleDeleteUser = async (id: number) => {
    try {
      const response = await fetch(`/api/users/${id}`, {
        method: "DELETE",
      })

      if (response.ok) {
        await fetchUsers()
      }
    } catch (error) {
      console.error("Failed to delete user:", error)
    }
  }

  const handleEditUser = (user: User) => {
    setEditingUser(user)
    setShowForm(true)
  }

  const handleCancelForm = () => {
    setShowForm(false)
    setEditingUser(null)
  }

  const stats = [
    {
      title: "Total Users",
      value: users.length,
      icon: Users,
      color: "text-blue-600",
    },
    {
      title: "Admins",
      value: users.filter((u) => u.role === "admin").length,
      icon: Database,
      color: "text-red-600",
    },
    {
      title: "Active Users",
      value: users.filter((u) => u.role === "user").length,
      icon: Activity,
      color: "text-green-600",
    },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-4">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-bold text-slate-900">User Management</h1>
          <p className="text-slate-600">Manage your users with full CRUD operations</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {stats.map((stat) => (
            <Card
              key={stat.title}
              className="transition-transform duration-300 hover:scale-105 hover:shadow-2xl hover:border-transparent group bg-white border border-slate-200 rounded-2xl"
            >
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-slate-600 group-hover:text-slate-500 transition-colors duration-300">
                      {stat.title}
                    </p>
                    <p className="text-3xl font-bold text-slate-900 group-hover:text-indigo-600 transition-colors duration-300">
                      {stat.value}
                    </p>
                  </div>
                  <stat.icon
                    className={`h-10 w-10 ${stat.color} transition-transform duration-300 transform group-hover:rotate-12 group-hover:scale-110`}
                  />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>


        {/* Controls */}
        <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-4 w-4" />
            <Input
              placeholder="Search users..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Button onClick={() => setShowForm(true)} className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Add User
          </Button>
        </div>

        {/* Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <UserList
              users={filteredUsers}
              onEdit={handleEditUser}
              onDelete={handleDeleteUser}
              isLoading={isLoading}
              onUserClick={(user) => {
                setSelectedUser(user)
                setIsUserDialogOpen(true)
              }}
            />
          </div>

          {showForm && (
            <div className="lg:col-span-1">
              <UserForm
                user={editingUser}
                onSubmit={editingUser ? handleUpdateUser : handleCreateUser}
                onCancel={handleCancelForm}
                isLoading={isFormLoading}
              />
            </div>
          )}
        </div>

        <Dialog open={isUserDialogOpen} onOpenChange={setIsUserDialogOpen}>
  <DialogContent className="rounded-2xl shadow-xl border border-slate-200 bg-white max-w-md mx-auto transition-all duration-300">
    <DialogHeader>
      <DialogTitle className="text-2xl font-bold text-slate-800 mb-2">User Details</DialogTitle>
      <DialogDescription className="text-sm text-slate-600">
        {selectedUser && (
          <div className="space-y-4 mt-4">
            <div className="flex justify-between">
              <span className="text-slate-500 font-medium">Name:</span>
              <span className="text-slate-800">{selectedUser.name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500 font-medium">Email:</span>
              <span className="text-slate-800">{selectedUser.email}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500 font-medium">Phone:</span>
              <span className="text-slate-800">{selectedUser.phone || "-"}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500 font-medium">Role:</span>
              <span className="capitalize text-slate-800">{selectedUser.role}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500 font-medium">Created:</span>
              <span className="text-slate-800">
                {new Date(selectedUser.createdAt).toLocaleString()}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500 font-medium">Updated:</span>
              <span className="text-slate-800">
                {new Date(selectedUser.updatedAt).toLocaleString()}
              </span>
            </div>
          </div>
        )}
      </DialogDescription>
    </DialogHeader>
  </DialogContent>
</Dialog>

      </div>
    </div>
  )
}
