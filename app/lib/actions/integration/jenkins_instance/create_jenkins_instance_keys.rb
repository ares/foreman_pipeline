require 'net/ssh'
require 'net/scp'
require 'uri'

module Actions
  module Integration
    module JenkinsInstance
      class CreateJenkinsInstanceKeys < EntryAction        
        include Mixins::SshExtension

        def run
          output[:pubkey] = fetch_pubkey(parse_host, input[:passwd])
        end

        def parse_host
          URI(input.fetch(:url)).host
        end

        def fetch_pubkey(host, passwd)
          buffer = StringIO.new          
          ip = Socket::getaddrinfo(host, 'www', nil, Socket::SOCK_STREAM)[0][3]
          Net::SSH.start(ip, 'root', :password => passwd) do |ssh|
            status = ssh_exec!(ssh, "ls #{key_location}")[2]           
            ssh.exec! "mkdir #{key_location}" if status > 0
            ssh.exec! "sed -i s:Defaults\\.*requiretty:#Defaults\\ requiretty:g /etc/sudoers"
            ssh.exec! "sudo -u jenkins ssh-keygen -f #{key_location}/#{parse_host} -t rsa -N '' -q"
            ssh.scp.download! "#{key_location}/#{parse_host}.pub", buffer
          end          
          buffer.string
        end        

        def key_location
          "#{input.fetch(:jenkins_home)}/.ssh"
        end

      end
    end
  end
end