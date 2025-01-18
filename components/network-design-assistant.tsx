/* eslint-disable @typescript-eslint/no-unused-vars */
"use client"

import React, { useState, useEffect, useRef } from "react"
import { Network, Node, Edge, Options } from "vis-network"
import { DataSet } from "vis-data"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import FileSaver from 'file-saver'
import * as XLSX from 'xlsx'
import { jsPDF } from "jspdf"
import html2canvas from "html2canvas"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle, HelpCircle } from 'lucide-react'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { ChatInterface } from "./chat-interface"

const deviceData = {
  router: {
    name: "Cisco ISR 4321 Router",
    specs: "2-core CPU, 4 GB DRAM, 4 GB flash memory",
    ports: "2x GE, 2x SFP",
    image: "https://api.iconify.design/mdi:router-wireless.svg",
    price: 2000
  },
  firewall: {
    name: "Fortinet FortiGate 60F Next-Generation Firewall",
    specs: "Dual-core CPU, 4 GB memory",
    ports: "10x GE RJ45 ports, 2x SFP ports",
    image: "https://api.iconify.design/mdi:firewall.svg",
    price: 1500
  },
  coreSwitch: {
    name: "Cisco Catalyst 9200 24-port Switch",
    specs: "Quad-core CPU, 8 GB DRAM, 16 GB flash memory",
    ports: "24x GE ports, 4x 10G SFP+ uplink ports",
    image: "https://api.iconify.design/mdi:switch.svg",
    price: 3000
  },
  server: {
    name: "Dell PowerEdge R440 Rack Server",
    specs: "Intel Xeon Silver 4210, 32 GB RAM, 2x 480GB SSD",
    ports: "4x 1GbE",
    image: "https://api.iconify.design/mdi:server.svg",
    price: 5000
  },
  printer: {
    name: "HP LaserJet Pro M404dn",
    specs: "1200 MHz processor, 256 MB memory",
    ports: "1x Gigabit Ethernet, 1x Hi-Speed USB 2.0",
    image: "https://api.iconify.design/mdi:printer.svg",
    price: 500
  },
  wirelessController: {
    name: "Cisco 3504 Wireless Controller",
    specs: "4-core CPU, 8 GB DRAM",
    ports: "8x GE ports",
    image: "https://api.iconify.design/mdi:wifi.svg",
    price: 2000
  },
  accessPoint: {
    name: "Cisco Aironet 2800 Series Access Point",
    specs: "4x4 MU-MIMO with 3 spatial streams",
    ports: "1x GE",
    image: "https://api.iconify.design/mdi:access-point.svg",
    price: 500
  },
  vpnLicense: {
    name: "Cisco AnyConnect Secure Mobility Client",
    price: 50
  }
}

export function NetworkDesignAssistant() {
  const [formData, setFormData] = useState({
    companySize: 0,
    budget: 0,
    officeUsers: 0,
    remoteUsers: 0,
    servers: 0,
    printers: 0,
    departments: 0,
  })
  const [departmentData, setDepartmentData] = useState<Array<{
    name: string,
    users: number,
    servers: number,
    printers: number,
  }>>([])
  const [networkOutput, setNetworkOutput] = useState({
    ipAllocation: "",
    recommendations: "",
    costEstimate: "",
  })
  const [error, setError] = useState<string | null>(null)
  const [networkType, setNetworkType] = useState<'wifi' | 'lan' | 'both'>('both')
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [, setZoomLevel] = useState(1)
  const [redundancy, setRedundancy] = useState(false)
  const [securityLevel, setSecurityLevel] = useState(1)
  const [networkData, setNetworkData] = useState<{ nodes: DataSet<Node>; edges: DataSet<Edge> } | null>(null)
  const networkRef = useRef<HTMLDivElement>(null)
  const networkInstance = useRef<Network | null>(null)
  const [interfaceType, setInterfaceType] = useState<'form' | 'chat'>('form')

  useEffect(() => {
    if (networkRef.current && !networkInstance.current) {
      initializeNetwork()
    }
  }, [])

  useEffect(() => {
    if (networkData) {
      createNetworkDiagram()
    }
  }, [formData, departmentData, networkType, redundancy, securityLevel, networkData])

  const initializeNetwork = () => {
    try {
      const nodes = new DataSet<Node>([])
      const edges = new DataSet<Edge>([])

      const options: Options = {
        layout: {
          hierarchical: {
            direction: "UD",
            sortMethod: "directed",
            levelSeparation: 150,
            nodeSpacing: 200,
          },
        },
        physics: false,
        nodes: {
          font: {
            size: 14,
            face: "Tahoma",
          },
          borderWidth: 2,
          shadow: true,
        },
        edges: {
          width: 2,
          shadow: true,
          arrows: {
            to: { enabled: true, scaleFactor: 1, type: "arrow" },
          },
        },
        interaction: {
          dragNodes: true,
          dragView: true,
          zoomView: true,
        },
      }

      networkInstance.current = new Network(networkRef.current!, { nodes, edges }, options)

      networkInstance.current.on("hoverNode", (params) => {
        const node = nodes.get(params.node) as Node
        if (node) {
          const nodePosition = networkInstance.current!.getPositions([params.node])[params.node]
          const canvasPosition = networkInstance.current!.canvasToDOM(nodePosition)
          showTooltip(getDeviceTooltip(node), canvasPosition.x, canvasPosition.y)
        }
      })

      networkInstance.current.on("blurNode", () => {
        hideTooltip()
      })

      setNetworkData({ nodes, edges })
    } catch (err) {
      console.error("Error initializing network:", err)
      setError("An error occurred while initializing the network diagram. Please try refreshing the page.")
    }
  }

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen)
    setTimeout(() => {
      if (networkInstance.current) {
        networkInstance.current.redraw()
        networkInstance.current.fit()
      }
    }, 100)
  }

  const handleZoom = (direction: 'in' | 'out') => {
    if (networkInstance.current) {
      const currentScale = networkInstance.current.getScale()
      const newScale = direction === 'in' ? currentScale * 1.2 : currentScale / 1.2
      networkInstance.current.moveTo({
        scale: newScale,
      })
      setZoomLevel(newScale)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: parseInt(value) || 0 }))
  }

  const handleDepartmentChange = (index: number, field: string, value: number | string) => {
    const newDepartmentData = [...departmentData]
    newDepartmentData[index] = { ...newDepartmentData[index], [field]: value }
    setDepartmentData(newDepartmentData)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    try {
      generateNetworkDesign()
    } catch (err) {
      console.error("Error generating network design:", err)
      setError("An error occurred while generating the network design. Please try again.")
    }
  }

  const generateNetworkDesign = () => {
    createNetworkDiagram()
    generateIPAllocation()
    generateRecommendations()
    generateCostEstimate()
  }

  const createNetworkDiagram = () => {
    if (!networkData) return

    const { nodes, edges } = networkData

    nodes.clear()
    edges.clear()

    nodes.add({ id: "internet", label: "Internet", shape: "image", image: "https://api.iconify.design/mdi:cloud.svg" })
    nodes.add({ id: "router", label: "Router\n192.168.1.1", shape: "image", image: deviceData.router.image })
    edges.add({ from: "internet", to: "router" })

    if (redundancy) {
      nodes.add({ id: "router2", label: "Backup Router\n192.168.1.2", shape: "image", image: deviceData.router.image })
      edges.add({ from: "internet", to: "router2" })
      edges.add({ from: "router", to: "router2", dashes: true })
    }

    nodes.add({ id: "firewall", label: "Firewall\n192.168.2.1", shape: "image", image: deviceData.firewall.image })
    edges.add({ from: "router", to: "firewall" })

    if (redundancy) {
      nodes.add({ id: "firewall2", label: "Backup Firewall\n192.168.2.2", shape: "image", image: deviceData.firewall.image })
      edges.add({ from: "router2", to: "firewall2" })
      edges.add({ from: "firewall", to: "firewall2", dashes: true })
    }

    nodes.add({ id: "coreSwitch", label: "Core Switch\n192.168.3.1", shape: "image", image: deviceData.coreSwitch.image })
    edges.add({ from: "firewall", to: "coreSwitch" })

    if (redundancy) {
      nodes.add({ id: "coreSwitch2", label: "Backup Core Switch\n192.168.3.2", shape: "image", image: deviceData.coreSwitch.image })
      edges.add({ from: "firewall2", to: "coreSwitch2" })
      edges.add({ from: "coreSwitch", to: "coreSwitch2", dashes: true })
    }

    let serverCounter = 1
    let printerCounter = 1

    departmentData.forEach((dept, index) => {
      const deptId = `dept${index}`
      nodes.add({ id: deptId, label: `${dept.name}\n192.168.${10 + index}.0/24`, shape: "image", image: "https://api.iconify.design/mdi:domain.svg" })
      edges.add({ from: "coreSwitch", to: deptId })

      for (let i = 1; i <= dept.servers; i++) {
        const serverId = `server${serverCounter}`
        nodes.add({ id: serverId, label: `${dept.name} Server ${i}\n192.168.${10 + index}.${serverCounter}`, shape: "image", image: deviceData.server.image })
        edges.add({ from: deptId, to: serverId })
        serverCounter++
      }

      for (let i = 1; i <= dept.printers; i++) {
        const printerId = `printer${printerCounter}`
        nodes.add({ id: printerId, label: `${dept.name} Printer ${i}\n192.168.${10 + index}.${100 + printerCounter}`, shape: "image", image: deviceData.printer.image })
        edges.add({ from: deptId, to: printerId })
        printerCounter++
      }

      for (let i = 1; i <= dept.users; i++) {
        const userId = `${deptId}_user${i}`
        nodes.add({ id: userId, label: `${dept.name} User ${i}\n192.168.${10 + index}.${200 + i}`, shape: "image", image: "https://api.iconify.design/mdi:desktop-classic.svg" })
        edges.add({ from: deptId, to: userId })
      }
    })

    if (networkType === 'wifi' || networkType === 'both') {
      nodes.add({ id: "wirelessController", label: "Wireless Controller\n192.168.4.1", shape: "image", image: deviceData.wirelessController.image })
      edges.add({ from: "coreSwitch", to: "wirelessController" })

      const apCount = Math.ceil(formData.officeUsers / 25)
      for (let i = 1; i <= apCount; i++) {
        nodes.add({ id: `ap${i}`, label: `AP ${i}\n192.168.4.${i + 1}`, shape: "image", image: deviceData.accessPoint.image })
        edges.add({ from: "wirelessController", to: `ap${i}` })
      }
    }

    if (formData.remoteUsers > 0) {
      nodes.add({ id: "vpnConcentrator", label: "VPN Concentrator\n192.168.20.1", shape: "image", image: "https://api.iconify.design/mdi:vpn.svg" })
      edges.add({ from: "firewall", to: "vpnConcentrator" })
      nodes.add({ id: "remoteUsers", label: `Remote Users\n192.168.20.0/24`, shape: "image", image: "https://api.iconify.design/mdi:account-group.svg" })
      edges.add({ from: "vpnConcentrator", to: "remoteUsers" })
    }

    if (networkInstance.current) {
      networkInstance.current.setData({ nodes, edges })
      networkInstance.current.fit()
    }
  }

  const generateIPAllocation = () => {
    let allocation = `<h3>IP Allocation:</h3><ul>`
    allocation += `<li>Public IP (Router WAN): 203.0.113.1/24 (example)</li>`
    allocation += `<li>Internal Network: 192.168.0.0/16</li>`
    allocation += `<li>Router: 192.168.1.1</li>`
    if (redundancy) {
      allocation += `<li>Backup Router: 192.168.1.2</li>`
    }
    allocation += `<li>Firewall: 192.168.2.1</li>`
    if (redundancy) {
      allocation += `<li>Backup Firewall: 192.168.2.2</li>`
    }
    allocation += `<li>Core Switch: 192.168.3.1</li>`
    if (redundancy) {
      allocation += `<li>Backup Core Switch: 192.168.3.2</li>`
    }
    allocation += `<li>Wireless Infrastructure: 192.168.4.0/24</li>`
    departmentData.forEach((dept, index) => {
      allocation += `<li>${dept.name}: 192.168.${10 + index}.0/24</li>`
    })
    if (formData.remoteUsers > 0) {
      allocation += `<li>VPN Users: 192.168.20.0/24</li>`
    }
    allocation += `</ul>`
    setNetworkOutput((prev) => ({ ...prev, ipAllocation: allocation }))
  }

  const generateRecommendations = async () => {
    let recommendationText = "<h3>Device Recommendations:</h3><ul>"
    recommendationText += `<li>Router: ${redundancy ? '2x ' : ''}${deviceData.router.name}</li>`
    recommendationText += `<li>Firewall: ${redundancy ? '2x ' : ''}${deviceData.firewall.name}</li>`
    recommendationText += `<li>Core Switch: ${redundancy ? '2x ' : ''}${deviceData.coreSwitch.name}</li>`
    
    const totalServers = departmentData.reduce((sum, dept) => sum + dept.servers, 0)
    const totalPrinters = departmentData.reduce((sum, dept) => sum + dept.printers, 0)
    
    recommendationText += `<li>Servers: ${totalServers}x ${deviceData.server.name}</li>`
    recommendationText += `<li>Printers: ${totalPrinters}x ${deviceData.printer.name}</li>`
    
    if (networkType === 'wifi' || networkType === 'both') {
      const apCount = Math.ceil(formData.officeUsers / 25)
      recommendationText += `<li>Wireless: ${deviceData.wirelessController.name}</li>`
      recommendationText += `<li>Access Points: ${apCount}x ${deviceData.accessPoint.name}</li>`
    }
    
    if (formData.remoteUsers > 0) {
      recommendationText += `<li>VPN: ${deviceData.vpnLicense.name} (License per user)</li>`
    }
    recommendationText += "</ul>"

    // Additional recommendations based on security level
    recommendationText += "<h3>Security Recommendations:</h3><ul>"
    if (securityLevel >= 1) {
      recommendationText += "<li>Implement strong password policies</li>"
      recommendationText += "<li>Enable firewall on all devices</li>"
    }
    if (securityLevel >= 2) {
      recommendationText += "<li>Set up a VLAN for each department</li>"
      recommendationText += "<li>Implement network access control (NAC)</li>"
    }
    if (securityLevel >= 3) {
      recommendationText += "<li>Deploy an intrusion detection/prevention system (IDS/IPS)</li>"
      recommendationText += "<li>Implement multi-factor authentication for all users</li>"
    }
    recommendationText += "</ul>"

    // Placeholder for AI API integration
    try {
      const aiRecommendations = await getAIRecommendations(formData)
      recommendationText += "<h3>AI-Generated Recommendations:</h3>"
      recommendationText += aiRecommendations
    } catch (error) {
      console.error("Error fetching AI recommendations:", error)
    }

    setNetworkOutput((prev) => ({ ...prev, recommendations: recommendationText }))
  }

  const generateCostEstimate = () => {
    let totalCost = 0
    let costBreakdown = `<h3>Cost Estimate:</h3><ul>`

    // Core infrastructure
    const routerCost = deviceData.router.price * (redundancy ? 2 : 1)
    totalCost += routerCost
    costBreakdown += `<li>Router(s): $${routerCost.toLocaleString()}</li>`

    const firewallCost = deviceData.firewall.price * (redundancy ? 2 : 1)
    totalCost += firewallCost
    costBreakdown += `<li>Firewall(s): $${firewallCost.toLocaleString()}</li>`

    const coreSwitchCost = deviceData.coreSwitch.price * (redundancy ? 2 : 1)
    totalCost += coreSwitchCost
    costBreakdown += `<li>Core Switch(es): $${coreSwitchCost.toLocaleString()}</li>`

    // Servers and Printers
    const totalServers = departmentData.reduce((sum, dept) => sum + dept.servers, 0)
    const totalPrinters = departmentData.reduce((sum, dept) => sum + dept.printers, 0)
    
    const serverCost = totalServers * deviceData.server.price
    totalCost += serverCost
    costBreakdown += `<li>Servers: $${serverCost.toLocaleString()}</li>`

    const printerCost = totalPrinters * deviceData.printer.price
    totalCost += printerCost
    costBreakdown += `<li>Printers: $${printerCost.toLocaleString()}</li>`

    // Wireless infrastructure
    if (networkType === 'wifi' || networkType === 'both') {
      const apCount = Math.ceil(formData.officeUsers / 25)
      const wirelessCost = deviceData.wirelessController.price + apCount * deviceData.accessPoint.price
      totalCost += wirelessCost
      costBreakdown += `<li>Wireless Infrastructure: $${wirelessCost.toLocaleString()}</li>`
    }

    // VPN
    if (formData.remoteUsers > 0) {
      const vpnCost = formData.remoteUsers * deviceData.vpnLicense.price
      totalCost += vpnCost
      costBreakdown += `<li>VPN Licenses: $${vpnCost.toLocaleString()}</li>`
    }

    costBreakdown += `</ul><p><strong>Total Estimated Cost: $${totalCost.toLocaleString()}</strong></p>`

    if (totalCost > formData.budget) {
      costBreakdown += `<p style="color: red;">Warning: The estimated cost exceeds your budget by $${(totalCost - formData.budget).toLocaleString()}.</p>`
    } else {
      costBreakdown += `<p style="color: green;">Good news! The estimated cost is within your budget. You have $${(formData.budget - totalCost).toLocaleString()} remaining.</p>`
    }

    setNetworkOutput((prev) => ({ ...prev, costEstimate: costBreakdown }))
  }

  // Placeholder function for AI API integration
  const getAIRecommendations = async (formData: { companySize: number; budget: number; officeUsers: number; remoteUsers: number; servers: number; printers: number; departments: number }) => {
    // This is where you would make an API call to an AI service
    // For now, we'll return a placeholder recommendation
    return new Promise<string>((resolve) => {
      setTimeout(() => {
        resolve(`
          <ul>
            <li>Consider implementing network segmentation for improved security.</li>
            <li>Implement a robust backup solution for critical data.</li>
            <li>Consider upgrading to Wi-Fi 6 for improved wireless performance.</li>
          </ul>
        `)
      }, 1000) // Simulating API delay
    })
  }

  const getDeviceType = (id: string) => {
    if (id.includes("server")) return "server"
    if (id.includes("printer")) return "printer"
    if (id === "router") return "router"
    if (id === "firewall") return "firewall"
    if (id === "coreSwitch") return "coreSwitch"
    if (id === "wirelessController") return "wirelessController"
    if (id.includes("ap")) return "accessPoint"
    if (id.includes("dept")) return "department"
    if (id === "vpnConcentrator") return "vpnConcentrator"
    if (id === "remoteUsers") return "remoteUsers"
    return "unknown"
  }

  const getIPFromLabel = (label: string) => {
    const match = label.match(/\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}(\/\d{1,2})?/)
    return match ? match[0] : "N/A"
  }

  const getDeviceTooltip = (node: Node) => {
    const deviceType = getDeviceType(node.id as string)
    const ip = getIPFromLabel(node.label as string)
    let content = `<strong>${node.label}</strong><br>IP: ${ip}<br>`

    if (deviceData[deviceType as keyof typeof deviceData]) {
      const info = deviceData[deviceType as keyof typeof deviceData]
      content += `Model: ${info.name}<br>`
      
    }

    return content
  }

  const showTooltip = (content: string, x: number, y: number) => {
    let tooltip = document.getElementById("tooltip")
    if (!tooltip) {
      tooltip = document.createElement("div")
      tooltip.id = "tooltip"
      tooltip.className = "absolute bg-black bg-opacity-80 text-white p-2 rounded text-sm z-50"
      document.body.appendChild(tooltip)
    }
    tooltip.innerHTML = content
    tooltip.style.left = `${x}px`
    tooltip.style.top = `${y}px`
    tooltip.style.display = "block"
  }

  const hideTooltip = () => {
    const tooltip = document.getElementById("tooltip")
    if (tooltip) {
      tooltip.style.display = "none"
    }
  }

  const exportDiagram = async (format: string) => {
    if (!networkInstance.current) return

    const networkContainer = document.querySelector('.vis-network') as HTMLElement
    if (!networkContainer) return

    // Force the network to redraw before exporting
    networkInstance.current.redraw()

    switch (format) {
      case 'png':
        // Wait for network to stabilize
        setTimeout(async () => {
          const canvas = await html2canvas(networkContainer, { 
            scale: 2,
            useCORS: true,
            allowTaint: true,
            backgroundColor: '#ffffff'
          })
          canvas.toBlob((blob) => {
            if (blob) FileSaver.saveAs(blob, 'network_diagram.png')
          })
        }, 1000)
        break
      case 'pdf':
        // Wait for network to stabilize
        setTimeout(async () => {
          const canvas = await html2canvas(networkContainer, {
            scale: 2,
            useCORS: true,
            allowTaint: true,
            backgroundColor: '#ffffff'
          })
          const imgData = canvas.toDataURL('image/png')
          const pdf = new jsPDF({
            orientation: 'landscape',
            unit: 'px',
            format: [networkContainer.offsetWidth, networkContainer.offsetHeight]
          })
          pdf.addImage(imgData, 'PNG', 0, 0, networkContainer.offsetWidth, networkContainer.offsetHeight)
          pdf.save('network_diagram.pdf')
        }, 1000)
        break
      case 'drawio':
        const drawioXml = generateDrawioXml()
        const blob = new Blob([drawioXml], { type: 'application/xml' })
        FileSaver.saveAs(blob, 'network_diagram.drawio')
        break
    }
  }

  const generateDrawioXml = () => {
    let xml = '<?xml version="1.0" encoding="UTF-8"?>\n'
    xml += '<mxfile host="app.diagrams.net" modified="2023-06-03T12:00:00.000Z" agent="5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36" etag="..." version="14.7.4" type="device">\n'
    xml += '  <diagram id="..." name="Network Diagram">\n'
    xml += '    <mxGraphModel dx="1422" dy="794" grid="1" gridSize="10" guides="1" tooltips="1" connect="1" arrows="1" fold="1" page="1" pageScale="1" pageWidth="827" pageHeight="1169" math="0" shadow="0">\n'
    xml += '      <root>\n'
    xml += '        <mxCell id="0" />\n'
    xml += '        <mxCell id="1" parent="0" />\n'

    if (networkData) {
      const { nodes, edges } = networkData

      nodes.forEach((node, index) => {
        const position = networkInstance.current!.getPositions([node.id])[node.id]
        xml += `        <mxCell id="node${index}" value="${node.label}" style="shape=image;image=${node.image};verticalLabelPosition=bottom;verticalAlign=top;rounded=1;whiteSpace=wrap;html=1;" vertex="1" parent="1">\n`
        xml += `          <mxGeometry x="${Math.round(position.x)}" y="${Math.round(position.y)}" width="80" height="80" as="geometry" />\n`
        xml += '        </mxCell>\n'
      })

      edges.forEach((edge, index) => {
        xml += `        <mxCell id="edge${index}" value="" style="endArrow=classic;html=1;" edge="1" parent="1" source="node${nodes.getIds().indexOf(edge.from as string)}" target="node${nodes.getIds().indexOf(edge.to as string)}">\n`
        xml += '          <mxGeometry width="50" height="50" relative="1" as="geometry">\n'
        xml += '            <mxPoint x="400" y="400" as="sourcePoint" />\n'
        xml += '            <mxPoint x="450" y="350" as="targetPoint" />\n'
        xml += '          </mxGeometry>\n'
        xml += '        </mxCell>\n'
      })
    }

    xml += '      </root>\n'
    xml += '    </mxGraphModel>\n'
    xml += '  </diagram>\n'
    xml += '</mxfile>'

    return xml
  }

  const exportIPTable = (format: string) => {
    const ipData = networkOutput.ipAllocation
      .replace(/<h3>.*?<\/h3>/g, '')  // Remove h3 tags
      .replace(/<\/?ul>/g, '')        // Remove ul tags
      .replace(/<li>(.*?)<\/li>/g, '$1') // Extract content from li tags
      .split('\n')
      .filter(line => line.trim() !== '')
      .map(line => {
        const [device, ip] = line.split(': ').map(s => s.trim())
        return { Device: device, IP: ip || 'N/A' }
      })
      .filter(item => item.IP !== 'N/A') // Remove entries without IPs

    switch (format) {
      case 'csv':
        const ws = XLSX.utils.json_to_sheet(ipData)
        const csv = XLSX.utils.sheet_to_csv(ws)
        const csvBlob = new Blob([csv], { type: 'text/csv;charset=utf-8' })
        FileSaver.saveAs(csvBlob, 'ip_allocation.csv')
        break
      case 'xlsx':
        const ws_xlsx = XLSX.utils.json_to_sheet(ipData)
        const wb = XLSX.utils.book_new()
        XLSX.utils.book_append_sheet(wb, ws_xlsx, "IP Allocation")
        XLSX.writeFile(wb, 'ip_allocation.xlsx')
        break
    }
  }

  return (
    <div className="container mx-auto p-4 bg-blue-50">
      <h1 className="text-3xl font-bold mb-6 text-center text-blue-800">Network Design Assistant for SMEs</h1>
      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      <div className="mb-4">
        <Label>Select Interface</Label>
        <Select onValueChange={(value) => setInterfaceType(value as 'form' | 'chat')}>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Select interface" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="form">Requirement Form</SelectItem>
            <SelectItem value="chat">AI Chatbot</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="flex flex-col lg:flex-row gap-8">
        <Card className="w-full lg:w-1/3 bg-white shadow-lg">
          <CardHeader className="bg-blue-600 text-white">
            <CardTitle>{interfaceType === 'form' ? 'Network Requirements' : 'AI Chatbot'}</CardTitle>
            <CardDescription className="text-blue-100">
              {interfaceType === 'form' ? 'Enter your network specifications' : 'Chat with our AI to design your network'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {interfaceType === 'form' ? (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="companySize">Company Size (employees)</Label>
                  <Input type="number" id="companySize" name="companySize" value={formData.companySize} onChange={handleInputChange} min={1} max={250} required placeholder="Enter company size" />
                </div>
                <div>
                  <Label htmlFor="budget">Budget (USD)</Label>
                  <Input type="number" id="budget" name="budget" value={formData.budget} onChange={handleInputChange} min={10000} required placeholder="Enter budget" />
                </div>
                <div>
                  <Label htmlFor="officeUsers">Office Users</Label>
                  <Input type="number" id="officeUsers" name="officeUsers" value={formData.officeUsers} onChange={handleInputChange} min={0}  placeholder="Enter number of office users" />
                </div>
                <div>
                  <Label htmlFor="remoteUsers">Remote Users</Label>
                  <Input type="number" id="remoteUsers" name="remoteUsers" value={formData.remoteUsers} onChange={handleInputChange} min={0}  placeholder="Enter number of remote users" />
                </div>
                <div>
                  <Label htmlFor="departments">Departments</Label>
                  <Input
                    type="number"
                    id="departments"
                    name="departments"
                    value={formData.departments}
                    onChange={(e) => {
                      handleInputChange(e)
                      const newDeptCount = parseInt(e.target.value) || 0
                      setDepartmentData(prevData => {
                        const newData = [...prevData]
                        while (newData.length < newDeptCount) {
                          newData.push({ name: "", users: 0, servers: 0, printers: 0 })
                        }
                        return newData.slice(0, newDeptCount)
                      })
                    }}
                    min={0}
                    max={10}
                    
                    placeholder="Enter number of departments"
                  />
                </div>
                {departmentData.map((dept, index) => (
                  <div key={index} className="space-y-2">
                    <Label htmlFor={`dept${index + 1}`}>Department {index + 1}</Label>
                    <Input
                      type="text"
                      id={`dept${index + 1}`}
                      value={dept.name}
                      onChange={(e) => handleDepartmentChange(index, 'name', e.target.value)}
                      placeholder="Department Name"
                      
                    />
                    <div className="flex space-x-2">
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Input
                              type="number"
                              value={dept.users}
                              onChange={(e) => handleDepartmentChange(index, 'users', parseInt(e.target.value) || 0)}
                              placeholder="Users"
                              min={0}
                              
                            />
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Number of users in this department</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Input
                              type="number"
                              value={dept.servers}
                              onChange={(e) => handleDepartmentChange(index, 'servers', parseInt(e.target.value) || 0)}
                              placeholder="Servers"
                              min={0}
                              
                            />
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Number of servers for this department</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Input
                              type="number"
                              value={dept.printers}
                              onChange={(e) => handleDepartmentChange(index, 'printers', parseInt(e.target.value) || 0)}
                              placeholder="Printers"
                              min={0}
                              
                            />
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Number of printers for this department</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>
                  </div>
                ))}
                <div>
                  <Label htmlFor="networkType">Network Type</Label>
                  <Select onValueChange={(value) => setNetworkType(value as 'wifi' | 'lan' | 'both')}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select network type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="wifi">WiFi</SelectItem>
                      <SelectItem value="lan">LAN</SelectItem>
                      <SelectItem value="both">Both</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    id="redundancy"
                    checked={redundancy}
                    onCheckedChange={setRedundancy}
                  />
                  <Label htmlFor="redundancy">Enable Redundancy</Label>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <HelpCircle className="h-4 w-4" />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Redundancy adds backup devices for critical components</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
                <div>
                  <Label htmlFor="securityLevel">Security Level</Label>
                  <Slider
                    id="securityLevel"
                    min={1}
                    max={3}
                    step={1}
                    value={[securityLevel]}
                    onValueChange={(value) => setSecurityLevel(value[0])}
                    className="mt-2"
                  />
                  <div className="flex justify-between text-xs mt-1">
                    <span>Basic</span>
                    <span>Advanced</span>
                    <span>Enterprise</span>
                  </div>
                </div>
                <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700">Generate Network Design</Button>
              </form>
            ) : (
              <ChatInterface onNetworkDesignGenerated={generateNetworkDesign} />
            )}
          </CardContent>
        </Card>
        <Card className="w-full lg:w-2/3 bg-white shadow-lg">
          <CardHeader className="bg-blue-600 text-white">
            <CardTitle>Network Design Output</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold mb-2 text-blue-800">Network Diagram</h3>
                <div className={`relative ${isFullscreen ? 'fixed inset-0 z-50 bg-background' : ''}`}>
                  <div ref={networkRef} className={`w-full ${isFullscreen ? 'h-screen' : 'h-[600px]'} border border-gray-300 rounded-md`} />
                  <div className="absolute top-2 right-2 flex space-x-2">
                    <Button onClick={() => handleZoom('in')} className="bg-blue-500 hover:bg-blue-600">+</Button>
                    <Button onClick={() => handleZoom('out')} className="bg-blue-500 hover:bg-blue-600">-</Button>
                    <Button onClick={toggleFullscreen} className="bg-blue-500 hover:bg-blue-600">
                      {isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
                    </Button>
                  </div>
                </div>
                <div className="mt-4">
                  <Select onValueChange={(value) => exportDiagram(value)}>
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Export Diagram" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="png">Export as PNG</SelectItem>
                      <SelectItem value="pdf">Export as PDF</SelectItem>
                      <SelectItem value="drawio">Export to draw.io</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <Tabs defaultValue="ip" className="w-full">
                <TabsList className="grid w-full grid-cols-3 bg-blue-100">
                  <TabsTrigger value="ip" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white">IP Allocation</TabsTrigger>
                  <TabsTrigger value="recommendations" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white">Recommendations</TabsTrigger>
                  <TabsTrigger value="cost" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white">Cost Estimate</TabsTrigger>
                </TabsList>
                <TabsContent value="ip">
                  <div dangerouslySetInnerHTML={{ __html: networkOutput.ipAllocation }} />
                  <div className="mt-4">
                    <Select onValueChange={(value) => exportIPTable(value)}>
                      <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Export IP Table" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="csv">Export as CSV</SelectItem>
                        <SelectItem value="xlsx">Export as Excel</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </TabsContent>
                <TabsContent value="recommendations">
                  <div dangerouslySetInnerHTML={{ __html: networkOutput.recommendations }} />
                </TabsContent>
                <TabsContent value="cost">
                  <div dangerouslySetInnerHTML={{ __html: networkOutput.costEstimate }} />
                </TabsContent>
              </Tabs>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}