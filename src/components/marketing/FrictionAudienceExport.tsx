
import React, { useState } from 'react';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle,
  CardFooter
} from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';
import { 
  Users, 
  Download, 
  Mail, 
  Share2, 
  Facebook, 
  MailCheck,
  Filter
} from 'lucide-react';

interface AudienceSegment {
  id: string;
  name: string;
  description: string;
  frictionType: string;
  userCount: number;
  conversionRate: number;
  status: 'active' | 'draft' | 'archived';
  lastUpdated: string;
  platforms: string[];
}

const audienceSegments: AudienceSegment[] = [
  {
    id: 'seg-1',
    name: 'Form Abandoners',
    description: 'Users who started but didn\'t complete signup forms',
    frictionType: 'Form Abandonment',
    userCount: 2487,
    conversionRate: 1.2,
    status: 'active',
    lastUpdated: '2024-05-12',
    platforms: ['Email', 'Facebook', 'Google Ads']
  },
  {
    id: 'seg-2',
    name: 'Rage Clickers',
    description: 'Users exhibiting rage clicks on landing pages',
    frictionType: 'Rage Clicks',
    userCount: 1845,
    conversionRate: 0.8,
    status: 'active',
    lastUpdated: '2024-05-15',
    platforms: ['Email', 'Facebook']
  },
  {
    id: 'seg-3',
    name: 'Payment Errors',
    description: 'Users who experienced technical errors during checkout',
    frictionType: 'Technical Error',
    userCount: 964,
    conversionRate: 2.4,
    status: 'draft',
    lastUpdated: '2024-05-10',
    platforms: ['Email']
  },
  {
    id: 'seg-4',
    name: 'Navigation Loops',
    description: 'Users caught in navigation loops during onboarding',
    frictionType: 'Navigation Loop',
    userCount: 1253,
    conversionRate: 1.7,
    status: 'active',
    lastUpdated: '2024-05-16',
    platforms: ['Email', 'Google Ads']
  },
  {
    id: 'seg-5',
    name: 'High-Value Cart Abandoners',
    description: 'Users with high-value carts who abandoned checkout',
    frictionType: 'Cart Abandonment',
    userCount: 734,
    conversionRate: 3.2,
    status: 'active',
    lastUpdated: '2024-05-14',
    platforms: ['Email', 'Facebook', 'Google Ads']
  }
];

export const FrictionAudienceExport: React.FC = () => {
  const { toast } = useToast();
  const [selectedSegments, setSelectedSegments] = useState<string[]>([]);
  
  const handleExport = (platform: string) => {
    const segmentsToExport = selectedSegments.length > 0 
      ? audienceSegments.filter(seg => selectedSegments.includes(seg.id))
      : [];
    
    toast({
      title: `Exporting ${segmentsToExport.length} segments to ${platform}`,
      description: `${segmentsToExport.length} audience segments will be exported to ${platform}`,
    });
  };
  
  const toggleSegment = (segmentId: string) => {
    setSelectedSegments(prev => 
      prev.includes(segmentId)
        ? prev.filter(id => id !== segmentId)
        : [...prev, segmentId]
    );
  };
  
  const handleSelectAll = () => {
    if (selectedSegments.length === audienceSegments.length) {
      setSelectedSegments([]);
    } else {
      setSelectedSegments(audienceSegments.map(seg => seg.id));
    }
  };
  
  const getStatusColor = (status: AudienceSegment['status']) => {
    const colors: Record<AudienceSegment['status'], string> = {
      active: 'bg-green-100 text-green-800',
      draft: 'bg-amber-100 text-amber-800',
      archived: 'bg-gray-100 text-gray-800'
    };
    
    return colors[status];
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Users className="h-5 w-5 text-primary" />
          <h2 className="text-xl font-semibold">Friction-Triggered Audience Export</h2>
        </div>
        
        <div className="flex gap-2">
          <Button variant="outline" size="sm" className="flex items-center gap-1">
            <Filter className="h-4 w-4" />
            <span>Filter</span>
          </Button>
          <Select defaultValue="all">
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Friction type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All friction types</SelectItem>
              <SelectItem value="form">Form abandonment</SelectItem>
              <SelectItem value="rage">Rage clicks</SelectItem>
              <SelectItem value="technical">Technical errors</SelectItem>
              <SelectItem value="navigation">Navigation loops</SelectItem>
              <SelectItem value="cart">Cart abandonment</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      
      <Card>
        <CardHeader className="pb-3">
          <CardTitle>Audience Segments</CardTitle>
          <CardDescription>
            Export user segments based on friction patterns to marketing platforms for targeted re-engagement.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[50px]">
                  <Checkbox 
                    checked={selectedSegments.length === audienceSegments.length} 
                    onCheckedChange={handleSelectAll}
                  />
                </TableHead>
                <TableHead>Segment Name</TableHead>
                <TableHead>Friction Type</TableHead>
                <TableHead className="text-right">Users</TableHead>
                <TableHead>CVR</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Last Updated</TableHead>
                <TableHead>Available Platforms</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {audienceSegments.map((segment) => (
                <TableRow key={segment.id}>
                  <TableCell>
                    <Checkbox 
                      checked={selectedSegments.includes(segment.id)} 
                      onCheckedChange={() => toggleSegment(segment.id)}
                    />
                  </TableCell>
                  <TableCell className="font-medium">
                    {segment.name}
                    <div className="text-xs text-muted-foreground">{segment.description}</div>
                  </TableCell>
                  <TableCell>{segment.frictionType}</TableCell>
                  <TableCell className="text-right">{segment.userCount.toLocaleString()}</TableCell>
                  <TableCell>{segment.conversionRate}%</TableCell>
                  <TableCell>
                    <Badge variant="outline" className={getStatusColor(segment.status)}>
                      {segment.status}
                    </Badge>
                  </TableCell>
                  <TableCell>{segment.lastUpdated}</TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {segment.platforms.map(platform => (
                        <Badge key={platform} variant="outline" className="bg-muted">
                          {platform}
                        </Badge>
                      ))}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
        <CardFooter className="border-t pt-6 flex-col items-start gap-4">
          <div className="w-full">
            <h4 className="text-sm font-medium mb-2">Export Selected Segments</h4>
            <div className="flex flex-wrap gap-2">
              <Button 
                variant="outline" 
                size="sm" 
                className="flex items-center gap-1"
                onClick={() => handleExport('Email')}
                disabled={selectedSegments.length === 0}
              >
                <Mail className="h-4 w-4" />
                <span>Email Platform</span>
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                className="flex items-center gap-1"
                onClick={() => handleExport('Facebook')}
                disabled={selectedSegments.length === 0}
              >
                <Facebook className="h-4 w-4" />
                <span>Facebook Ads</span>
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                className="flex items-center gap-1"
                onClick={() => handleExport('Google')}
                disabled={selectedSegments.length === 0}
              >
                <Share2 className="h-4 w-4" />
                <span>Google Ads</span>
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                className="flex items-center gap-1"
                onClick={() => handleExport('CSV')}
                disabled={selectedSegments.length === 0}
              >
                <Download className="h-4 w-4" />
                <span>Export CSV</span>
              </Button>
            </div>
          </div>
          
          <div className="w-full">
            <h4 className="text-sm font-medium mb-2">Create New Audience Segment</h4>
            <div className="flex gap-2">
              <Input placeholder="Segment name" className="max-w-xs" />
              <Button>Create Segment</Button>
            </div>
          </div>
        </CardFooter>
      </Card>
      
      <Card>
        <CardHeader className="pb-3">
          <CardTitle>Re-engagement Campaigns</CardTitle>
          <CardDescription>
            Recent campaigns using friction-triggered audience segments
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 rounded-full">
                  <Mail className="h-5 w-5 text-blue-700" />
                </div>
                <div>
                  <h4 className="font-medium">Form Abandoners Recovery</h4>
                  <p className="text-sm text-muted-foreground">2487 users • Sent 3 days ago</p>
                </div>
              </div>
              <div className="flex items-center gap-6">
                <div>
                  <p className="text-sm text-muted-foreground">Open rate</p>
                  <p className="font-medium">32%</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Conversion</p>
                  <p className="font-medium">4.2%</p>
                </div>
                <Badge className="ml-2 bg-green-100 text-green-800">Active</Badge>
              </div>
            </div>
            
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 rounded-full">
                  <Facebook className="h-5 w-5 text-blue-700" />
                </div>
                <div>
                  <h4 className="font-medium">Cart Abandoners - High Value</h4>
                  <p className="text-sm text-muted-foreground">734 users • Started 1 week ago</p>
                </div>
              </div>
              <div className="flex items-center gap-6">
                <div>
                  <p className="text-sm text-muted-foreground">CTR</p>
                  <p className="font-medium">2.8%</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Conversion</p>
                  <p className="font-medium">3.7%</p>
                </div>
                <Badge className="ml-2 bg-green-100 text-green-800">Active</Badge>
              </div>
            </div>
            
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 rounded-full">
                  <MailCheck className="h-5 w-5 text-blue-700" />
                </div>
                <div>
                  <h4 className="font-medium">Technical Error Recovery</h4>
                  <p className="text-sm text-muted-foreground">964 users • Completed</p>
                </div>
              </div>
              <div className="flex items-center gap-6">
                <div>
                  <p className="text-sm text-muted-foreground">Open rate</p>
                  <p className="font-medium">28%</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Conversion</p>
                  <p className="font-medium">5.1%</p>
                </div>
                <Badge className="ml-2 bg-gray-100 text-gray-800">Completed</Badge>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
