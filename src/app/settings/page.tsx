"use client"

import { useState } from "react"
import Shell from "@/components/Shell"
import Sidebar from "@/components/Sidebar"
import { CheckCircle, Link } from "lucide-react"

const settingsTabs = ["Workspace", "Integrations", "Voice", "Notifications", "Billing"]

const platforms = [
  { name: "LinkedIn", color: "bg-blue-600", connected: true },
  { name: "Instagram", color: "bg-pink-500", connected: false },
  { name: "X / Twitter", color: "bg-slate-800", connected: false },
  { name: "WordPress", color: "bg-blue-400", connected: true },
  { name: "Google Analytics", color: "bg-amber-500", connected: false },
  { name: "Mailchimp", color: "bg-amber-400", connected: false },
]

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState("Workspace")
  const [businessName, setBusinessName] = useState("Trust Tai")
  const [website, setWebsite] = useState("trusttai.com")
  const [industry, setIndustry] = useState("Web Development / AI")
  const [timezone, setTimezone] = useState("America/Chicago")
  const [linkedIn, setLinkedIn] = useState(true)
  const [instagram, setInstagram] = useState(true)
  const [twitter, setTwitter] = useState(false)
  const [newsletter, setNewsletter] = useState(true)

  return (
    <>
      <Sidebar />
      <Shell>
        <div className="px-8 py-6">
          {/* Header */}
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-[#0F172A]">Settings</h1>
          </div>

          {/* Tabs */}
          <div className="flex gap-1 bg-white rounded-xl border border-gray-200 shadow-sm p-1 mb-6 w-fit">
            {settingsTabs.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-1.5 text-sm font-medium rounded-lg transition-colors ${
                  activeTab === tab
                    ? "bg-blue-600 text-white"
                    : "text-[#64748B] hover:bg-gray-100"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* Workspace Tab */}
          {activeTab === "Workspace" && (
            <div className="max-w-2xl space-y-6">
              {/* Business Info */}
              <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
                <h2 className="text-sm font-semibold text-[#0F172A] mb-5">Business Information</h2>
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-medium text-[#64748B] mb-1.5">Business Name</label>
                    <input
                      type="text"
                      value={businessName}
                      onChange={(e) => setBusinessName(e.target.value)}
                      className="w-full px-3 py-2 text-sm rounded-lg border border-gray-200 focus:outline-none focus:border-blue-400 bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-[#64748B] mb-1.5">Website</label>
                    <input
                      type="text"
                      value={website}
                      onChange={(e) => setWebsite(e.target.value)}
                      className="w-full px-3 py-2 text-sm rounded-lg border border-gray-200 focus:outline-none focus:border-blue-400 bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-[#64748B] mb-1.5">Industry</label>
                    <input
                      type="text"
                      value={industry}
                      onChange={(e) => setIndustry(e.target.value)}
                      className="w-full px-3 py-2 text-sm rounded-lg border border-gray-200 focus:outline-none focus:border-blue-400 bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-[#64748B] mb-1.5">Timezone</label>
                    <select
                      value={timezone}
                      onChange={(e) => setTimezone(e.target.value)}
                      className="w-full px-3 py-2 text-sm rounded-lg border border-gray-200 focus:outline-none focus:border-blue-400 bg-white"
                    >
                      <option value="America/Chicago">America/Chicago (CDT)</option>
                      <option value="America/New_York">America/New_York (EDT)</option>
                      <option value="America/Los_Angeles">America/Los_Angeles (PDT)</option>
                      <option value="UTC">UTC</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Posting Defaults */}
              <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
                <h2 className="text-sm font-semibold text-[#0F172A] mb-5">Posting Defaults</h2>
                <p className="text-xs text-[#64748B] mb-4">Select which platforms to include by default when creating content.</p>
                <div className="space-y-3">
                  {[
                    { label: "LinkedIn", value: linkedIn, set: setLinkedIn, color: "bg-blue-600" },
                    { label: "Instagram", value: instagram, set: setInstagram, color: "bg-pink-500" },
                    { label: "X / Twitter", value: twitter, set: setTwitter, color: "bg-slate-700" },
                    { label: "Newsletter", value: newsletter, set: setNewsletter, color: "bg-purple-600" },
                  ].map((p) => (
                    <label key={p.label} className="flex items-center justify-between cursor-pointer">
                      <div className="flex items-center gap-3">
                        <div className={`w-6 h-6 rounded-md ${p.color} flex items-center justify-center`}>
                          <span className="text-white text-[10px] font-bold">{p.label[0]}</span>
                        </div>
                        <span className="text-sm text-[#0F172A]">{p.label}</span>
                      </div>
                      <button
                        onClick={() => p.set(!p.value)}
                        className={`w-10 h-5 rounded-full transition-colors relative ${p.value ? "bg-blue-600" : "bg-gray-200"}`}
                      >
                        <span
                          className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform ${
                            p.value ? "translate-x-5" : "translate-x-0.5"
                          }`}
                        />
                      </button>
                    </label>
                  ))}
                </div>
              </div>

              {/* Save */}
              <button className="px-6 py-2.5 bg-blue-600 text-white text-sm font-semibold rounded-lg hover:bg-blue-700 transition-colors">
                Save Changes
              </button>
            </div>
          )}

          {/* Integrations Tab */}
          {activeTab === "Integrations" && (
            <div className="max-w-3xl">
              <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
                <h2 className="text-sm font-semibold text-[#0F172A] mb-2">Connected Integrations</h2>
                <p className="text-xs text-[#64748B] mb-6">Connect your platforms to enable publishing and analytics.</p>
                <div className="grid grid-cols-3 gap-4">
                  {platforms.map((platform) => (
                    <div key={platform.name} className="border border-gray-200 rounded-xl p-4 flex flex-col items-center text-center gap-3">
                      <div className={`w-12 h-12 rounded-xl ${platform.color} flex items-center justify-center`}>
                        <span className="text-white font-bold text-lg">{platform.name[0]}</span>
                      </div>
                      <p className="text-sm font-semibold text-[#0F172A]">{platform.name}</p>
                      {platform.connected ? (
                        <div className="flex items-center gap-1.5">
                          <CheckCircle className="w-3.5 h-3.5 text-green-600" />
                          <span className="text-xs text-green-600 font-medium">Connected</span>
                        </div>
                      ) : (
                        <button className="px-4 py-1.5 text-xs font-semibold text-blue-600 border border-blue-200 rounded-lg hover:bg-blue-50 transition-colors flex items-center gap-1.5">
                          <Link className="w-3 h-3" />
                          Connect
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Voice Tab */}
          {activeTab === "Voice" && (
            <div className="max-w-2xl">
              <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
                <h2 className="text-sm font-semibold text-[#0F172A] mb-2">Voice Settings</h2>
                <p className="text-xs text-[#64748B] mb-6">Configure your Founder Voice profile for AI content generation.</p>
                <div className="flex items-center gap-3 p-4 bg-green-50 rounded-xl border border-green-100">
                  <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-semibold text-[#0F172A]">Voice Profile Active</p>
                    <p className="text-xs text-[#64748B]">Voice Score: 92/100 — Last updated Jun 27</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Notifications Tab */}
          {activeTab === "Notifications" && (
            <div className="max-w-2xl">
              <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
                <h2 className="text-sm font-semibold text-[#0F172A] mb-2">Notification Preferences</h2>
                <p className="text-xs text-[#64748B] mb-6">Choose how and when you receive notifications.</p>
                <div className="space-y-4">
                  {["Approval requests", "Scheduled post reminders", "Performance alerts", "Agent recommendations", "Weekly digest"].map((item) => (
                    <div key={item} className="flex items-center justify-between">
                      <span className="text-sm text-[#0F172A]">{item}</span>
                      <div className="w-10 h-5 rounded-full bg-blue-600 relative">
                        <span className="absolute top-0.5 right-0.5 w-4 h-4 rounded-full bg-white shadow" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Billing Tab */}
          {activeTab === "Billing" && (
            <div className="max-w-2xl">
              <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
                <h2 className="text-sm font-semibold text-[#0F172A] mb-2">Billing</h2>
                <p className="text-xs text-[#64748B] mb-6">Manage your subscription and payment details.</p>
                <div className="p-4 bg-blue-50 rounded-xl border border-blue-100">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm font-semibold text-[#0F172A]">Trust Tai Content Engine — Pro</p>
                    <span className="px-2 py-0.5 bg-green-100 text-green-700 text-xs font-semibold rounded-full">Active</span>
                  </div>
                  <p className="text-xs text-[#64748B]">Next billing date: August 1, 2026</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </Shell>
    </>
  )
}
