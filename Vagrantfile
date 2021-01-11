# -*- mode: ruby -*-
# vi: set ft=ruby :

require 'fileutils'

RIOTBASE ||= "./"

Vagrant.configure("2") do |config|
    config.vm.define "RIOT-VM"
    config.vm.box = "RIOT/ubuntu1804"
    config.ssh.username = "user"
    config.vm.synced_folder RIOTBASE, "/home/user/SWP_IoT_Corona"

    if File.exists?(File.join(Dir.home, ".gitconfig"))
        config.vm.provision "file", source: File.join(Dir.home, ".gitconfig"), destination: ".gitconfig"
    end

    config.vm.provider :virtualbox do |v, override|
        v.customize [ "guestproperty", "set", :id, "/VirtualBox/GuestAdd/VBoxService/--timesync-set-on-restore", 0]
        v.customize ["modifyvm", :id, "--natdnshostresolver1", "on"]
        v.customize ["modifyvm", :id, "--natdnsproxy1", "on"]

        # additional USB passthrough entries
        # v.customize ['usbfilter', 'add', '0', '--target', :id, '--name', '<custom_name>', '--vendorid', '<vID>', '--productid', '<pID>']
    end
end