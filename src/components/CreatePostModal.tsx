'use client'

import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { addPost } from '@/lib/store'
import type { Platform, PostStatus, PostCategory } from '@/data/posts'

const PLATFORMS: Platform[] = ['LinkedIn', 'Instagram', 'X', 'Blog']
const CATEGORIES: PostCategory[] = [
  'Founder Insight', 'Client Education', 'Proof/Case Study',
  'Behind the Scenes', 'Offer/Sales', 'Thought Leadership',
  'Personal Story', 'FAQs',
]
const PILLARS = [
  'The Roadmap', 'Founder Bottlenecks', 'Systems That Scale',
  'Spirit First', 'Client Transformation',
]
const CAMPAIGNS = ['Roadmap Launch', 'Founder Authority Series', 'Spirit First Awareness', 'None']
const GRADIENTS: { from: string; to: string; label: string }[] = [
  { from: '#1e3a5f', to: '#2563EB', label: 'Navy Blue' },
  { from: '#1a1a2e', to: '#7C3AED', label: 'Deep Purple' },
  { from: '#14532d', to: '#16A34A', label: 'Forest Green' },
  { from: '#7c2d12', to: '#EA580C', label: 'Ember' },
  { from: '#1e3a5f', to: '#0891B2', label: 'Ocean' },
  { from: '#3b0764', to: '#9333EA', label: 'Violet' },
  { from: '#0f172a', to: '#475569', label: 'Slate' },
  { from: '#78350f', to: '#D97706', label: 'Amber' },
]

interface Props {
  open: boolean
  onClose?: () => void
  onOpenChange?: (open: boolean) => void
  onCreated?: () => void
  onSaved?: () => void
}

export default function CreatePostModal({ open, onClose, onOpenChange, onCreated, onSaved }: Props) {
  const handleClose = () => { onClose?.(); onOpenChange?.(false) }

  const [hook, setHook] = useState('')
  const [body, setBody] = useState('')
  const [cta, setCta] = useState('')
  const [platforms, setPlatforms] = useState<Platform[]>(['LinkedIn'])
  const [category, setCategory] = useState<PostCategory>('Founder Insight')
  const [pillar, setPillar] = useState(PILLARS[0])
  const [campaign, setCampaign] = useState(CAMPAIGNS[0])
  const [scheduledDate, setScheduledDate] = useState('')
  const [gradientIdx, setGradientIdx] = useState(0)
  const [saved, setSaved] = useState(false)

  function togglePlatform(p: Platform) {
    setPlatforms(prev =>
      prev.includes(p) ? prev.filter(x => x !== p) : [...prev, p]
    )
  }

  function handleSave(status: PostStatus) {
    const g = GRADIENTS[gradientIdx]
    addPost({
      hook,
      body,
      cta,
      platforms,
      status,
      category,
      owner: 'Tai',
      date: scheduledDate || new Date().toISOString().split('T')[0],
      gradientFrom: g.from,
      gradientTo: g.to,
      agentScore: Math.floor(Math.random() * 15) + 80,
      contentPillar: pillar,
      campaign: campaign !== 'None' ? campaign : undefined,
      scheduleDate: scheduledDate || undefined,
    })
    setSaved(true)
    setTimeout(() => {
      setSaved(false)
      setHook(''); setBody(''); setCta('')
      setPlatforms(['LinkedIn']); setCategory('Founder Insight')
      setPillar(PILLARS[0]); setCampaign(CAMPAIGNS[0])
      setScheduledDate(''); setGradientIdx(0)
      onCreated?.()
      onSaved?.()
      handleClose()
    }, 800)
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-[#0F172A]">Create New Post</DialogTitle>
        </DialogHeader>

        <div className="space-y-5 pt-2">
          {/* Hook */}
          <div>
            <div className="flex justify-between mb-1">
              <label className="text-sm font-medium text-[#0F172A]">Hook / Opening Line</label>
              <span className="text-xs text-[#94A3B8]">{hook.length}/100</span>
            </div>
            <Textarea
              value={hook}
              onChange={e => setHook(e.target.value.slice(0, 100))}
              placeholder="The founder with a $3M ceiling who thought he needed a CMO."
              rows={2}
              className="resize-none text-sm"
            />
          </div>

          {/* Body */}
          <div>
            <div className="flex justify-between mb-1">
              <label className="text-sm font-medium text-[#0F172A]">Caption / Body</label>
              <span className="text-xs text-[#94A3B8]">{body.length}/3000</span>
            </div>
            <Textarea
              value={body}
              onChange={e => setBody(e.target.value.slice(0, 3000))}
              placeholder="Write the full post body here..."
              rows={6}
              className="resize-none text-sm"
            />
          </div>

          {/* CTA */}
          <div>
            <label className="text-sm font-medium text-[#0F172A] block mb-1">CTA (one line)</label>
            <Input
              value={cta}
              onChange={e => setCta(e.target.value)}
              placeholder="→ discoverycall.ai"
              className="text-sm"
            />
          </div>

          {/* Platforms */}
          <div>
            <label className="text-sm font-medium text-[#0F172A] block mb-2">Platforms</label>
            <div className="flex gap-2 flex-wrap">
              {PLATFORMS.map(p => (
                <button
                  key={p}
                  onClick={() => togglePlatform(p)}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
                    platforms.includes(p)
                      ? 'bg-blue-600 text-white border-blue-600'
                      : 'bg-white text-[#64748B] border-[#E5E7EB] hover:border-blue-300'
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>

          {/* Category + Pillar */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-[#0F172A] block mb-1">Category</label>
              <select
                value={category}
                onChange={e => setCategory(e.target.value as PostCategory)}
                className="w-full border border-[#E5E7EB] rounded-lg px-3 py-2 text-sm text-[#0F172A] bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {CATEGORIES.map(c => <option key={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="text-sm font-medium text-[#0F172A] block mb-1">Content Pillar</label>
              <select
                value={pillar}
                onChange={e => setPillar(e.target.value)}
                className="w-full border border-[#E5E7EB] rounded-lg px-3 py-2 text-sm text-[#0F172A] bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {PILLARS.map(p => <option key={p}>{p}</option>)}
              </select>
            </div>
          </div>

          {/* Campaign + Date */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-[#0F172A] block mb-1">Campaign</label>
              <select
                value={campaign}
                onChange={e => setCampaign(e.target.value)}
                className="w-full border border-[#E5E7EB] rounded-lg px-3 py-2 text-sm text-[#0F172A] bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {CAMPAIGNS.map(c => <option key={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="text-sm font-medium text-[#0F172A] block mb-1">Schedule Date</label>
              <input
                type="datetime-local"
                value={scheduledDate}
                onChange={e => setScheduledDate(e.target.value)}
                className="w-full border border-[#E5E7EB] rounded-lg px-3 py-2 text-sm text-[#0F172A] bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Card Color */}
          <div>
            <label className="text-sm font-medium text-[#0F172A] block mb-2">Card Color</label>
            <div className="flex gap-2 flex-wrap">
              {GRADIENTS.map((g, i) => (
                <button
                  key={i}
                  onClick={() => setGradientIdx(i)}
                  title={g.label}
                  className={`w-8 h-8 rounded-lg transition-all ${gradientIdx === i ? 'ring-2 ring-offset-2 ring-blue-600 scale-110' : ''}`}
                  style={{ background: `linear-gradient(135deg, ${g.from}, ${g.to})` }}
                />
              ))}
            </div>
          </div>

          {/* Preview */}
          <div
            className="h-16 rounded-xl flex items-end p-3 transition-all"
            style={{ background: `linear-gradient(135deg, ${GRADIENTS[gradientIdx].from}, ${GRADIENTS[gradientIdx].to})` }}
          >
            <p className="text-white text-xs font-medium line-clamp-1 opacity-90">
              {hook || 'Your hook will appear here...'}
            </p>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-2 border-t border-[#E5E7EB]">
            <Button variant="outline" onClick={handleClose} className="text-sm">Cancel</Button>
            <Button
              variant="outline"
              onClick={() => handleSave('Draft')}
              disabled={!hook || saved}
              className="text-sm"
            >
              Save as Draft
            </Button>
            <Button
              onClick={() => handleSave('Needs Review')}
              disabled={!hook || saved}
              className="bg-blue-600 hover:bg-blue-700 text-white text-sm"
            >
              {saved ? 'Saved!' : 'Send to Review'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
