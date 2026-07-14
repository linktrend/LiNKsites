'use client';

import { ResourcePageLayout } from '@/components/layouts/ResourcePageLayout';
import { Video, ExternalLink, Book, Code, Github, Youtube, FileText } from 'lucide-react';

export default function LibraryPage() {

  const videoTutorials = [
    {
      id: '1',
      title: 'Getting Started - Platform Overview',
      duration: '5:30',
      description: 'Learn the basics of navigating the platform and setting up your account',
      thumbnail: '/placeholder-video.jpg',
      url: 'https://www.youtube.com/watch?v=example1'
    },
    {
      id: '2',
      title: 'Creating Your First Project',
      duration: '8:45',
      description: 'Step-by-step guide to creating and configuring your first project',
      thumbnail: '/placeholder-video.jpg',
      url: 'https://www.youtube.com/watch?v=example2'
    },
    {
      id: '3',
      title: 'Team Collaboration Features',
      duration: '12:20',
      description: 'Discover how to collaborate effectively with your team members',
      thumbnail: '/placeholder-video.jpg',
      url: 'https://www.youtube.com/watch?v=example3'
    },
    {
      id: '4',
      title: 'Advanced Features & Integrations',
      duration: '15:00',
      description: 'Explore advanced features and third-party integrations',
      thumbnail: '/placeholder-video.jpg',
      url: 'https://www.youtube.com/watch?v=example4'
    }
  ];

  const thirdPartyResources = [
    {
      id: '1',
      title: 'Official Documentation',
      description: 'Complete API reference and developer guides',
      icon: <Book className="h-6 w-6" />,
      url: 'https://docs.example.com',
      type: 'Documentation'
    },
    {
      id: '2',
      title: 'GitHub Repository',
      description: 'View source code, report issues, and contribute',
      icon: <Github className="h-6 w-6" />,
      url: 'https://github.com/example/repo',
      type: 'Code'
    },
    {
      id: '3',
      title: 'Community Forum',
      description: 'Ask questions and connect with other users',
      icon: <FileText className="h-6 w-6" />,
      url: 'https://community.example.com',
      type: 'Community'
    },
    {
      id: '4',
      title: 'YouTube Channel',
      description: 'Video tutorials and product updates',
      icon: <Youtube className="h-6 w-6" />,
      url: 'https://youtube.com/@example',
      type: 'Video'
    },
    {
      id: '5',
      title: 'Code Examples',
      description: 'Sample projects and implementation guides',
      icon: <Code className="h-6 w-6" />,
      url: 'https://examples.example.com',
      type: 'Code'
    },
    {
      id: '6',
      title: 'Blog & Updates',
      description: 'Latest news, tips, and best practices',
      icon: <FileText className="h-6 w-6" />,
      url: 'https://blog.example.com',
      type: 'Blog'
    }
  ];

  return (
    <ResourcePageLayout
      title="Resource Library"
      subtitle="Everything you need to succeed with our platform"
      headerContent={
        <div className="py-12 text-center bg-muted/30 rounded-lg">
          <p className="text-muted-foreground">
            Interactive performance visualization coming soon
          </p>
        </div>
      }
      mainContent={
        <div className="space-y-16">
          {/* Video Tutorials Section */}
          <div>
            <div className="mb-8">
              <h2 className="text-3xl font-bold mb-2">Video Tutorials</h2>
              <p className="text-muted-foreground">
                Watch step-by-step tutorials to learn how to use our platform effectively
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {videoTutorials.map((video) => (
                <div
                  key={video.id}
                  className="border border-border rounded-lg overflow-hidden hover:shadow-lg transition-shadow"
                >
                  <div className="relative aspect-video bg-muted flex items-center justify-center">
                    <Video className="h-16 w-16 text-muted-foreground/30" />
                    <div className="absolute bottom-2 right-2 bg-black/80 text-white text-xs px-2 py-1 rounded">
                      {video.duration}
                    </div>
                  </div>
                  <div className="p-4">
                    <h3 className="text-lg font-semibold mb-2">{video.title}</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      {video.description}
                    </p>
                    <a
                      href={video.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary hover:underline text-sm font-medium inline-flex items-center gap-1"
                    >
                      Watch Video
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Third-Party Resources Section */}
          <div>
            <div className="mb-8">
              <h2 className="text-3xl font-bold mb-2">Third-Party Resources</h2>
              <p className="text-muted-foreground">
                Explore additional resources from our community and partners
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {thirdPartyResources.map((resource) => (
                <div
                  key={resource.id}
                  className="p-6 bg-background rounded-lg border hover:shadow-lg transition-shadow"
                >
                  <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4 text-primary">
                    {resource.icon}
                  </div>
                  <div className="mb-2">
                    <span className="inline-block px-2 py-1 text-xs font-semibold bg-primary/10 text-primary rounded-full">
                      {resource.type}
                    </span>
                  </div>
                  <h3 className="text-xl font-semibold mb-2">{resource.title}</h3>
                  <p className="text-muted-foreground mb-4">
                    {resource.description}
                  </p>
                  <a
                    href={resource.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:underline text-sm font-medium inline-flex items-center gap-1"
                  >
                    Visit Resource
                    <ExternalLink className="h-3 w-3" />
                  </a>
                </div>
              ))}
            </div>
          </div>
        </div>
      }
    />
  );
}
