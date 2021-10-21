require 'faraday'
require 'json'
require 'date'
require 'aws-sdk-s3'

class ArtworksOfTheDay
  def self.generate_for_today(api_token, s3_key, s3_secret)
    new(api_token, s3_key, s3_secret).generate_for_today
  end

  def initialize(api_token, s3_key, s3_secret)
    @api_token = api_token
    @s3_key = s3_key
    @s3_secret = s3_secret
    @trending_artist_ids = []
    @artwork_ids = []
  end

  def generate_for_today
    fetch_trending_artist_ids
    fetch_artwork_ids
    update_s3
  end

  private

  def base_api_url
    'https://api.artsy.net/api/v1'
  end

  def fetch_trending_artist_ids
    url = "#{base_api_url}/artists?page=1&size=10&sort=-trending&access_token=#{@api_token}"

    response = Faraday.get(url)
    data = JSON.parse(response.body)
    @trending_artist_ids = data.map { |artist| artist['_id'] }
  end

  def fetch_artwork_ids
    artwork_ids = @trending_artist_ids.map do |artist_id|
      url = "#{base_api_url}/artist/#{artist_id}/artworks?filter%5B%5D=for_sale&offset=0&published=true&size=1&sort=-merchandisability&access_token=#{@api_token}"

      response = Faraday.get(url)
      data = JSON.parse(response.body)
      next unless data.first

      data.first['_id']
    end

    @artwork_ids = artwork_ids.compact
  end

  def update_s3
    bucket = 'artsy-public'

    credentials = Aws::Credentials.new(@s3_key, @s3_secret)
    s3 = Aws::S3::Client.new(region: 'us-east-1', credentials: credentials)

    data = JSON.dump(@artwork_ids)
    filename = ['artworks-of-the-day/', Date.today.to_s, '.json'].join
    s3.put_object(bucket: bucket, acl: 'public-read', key: filename, body: data)

    puts "https://#{bucket}.s3.amazonaws.com/#{filename}"
  end
end

token = ENV['TOKEN']
s3_key = ENV['AWS_ACCESS_KEY_ID']
s3_secret = ENV['AWS_SECRET_ACCESS_KEY']
ArtworksOfTheDay.generate_for_today(token, s3_key, s3_secret)
